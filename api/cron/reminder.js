import { sql } from '@vercel/postgres';

async function sendFonnteMessage(token, targetPhone, messageText) {
  const cleanPhone = targetPhone.toString().replace(/\D/g, '');
  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': token.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      target: cleanPhone,
      message: messageText,
      countryCode: '62'
    })
  });
  return await response.json();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // Hanya izinkan metode GET (sesuai standar Vercel Cron)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method tidak diizinkan. Gunakan GET.' });
  }

  try {
    // 1. Ambil Token Fonnte dari database
    const settingRes = await sql`SELECT key_value FROM settings WHERE key_name = 'fonnte_token'`;
    const fonnteToken = settingRes.rows[0]?.key_value;

    if (!fonnteToken || !fonnteToken.trim()) {
      console.warn('[CRON] Token Fonnte belum dikonfigurasi di Pengaturan.');
      return res.status(200).json({
        success: false,
        message: 'Token Fonnte belum diatur. Cron dilewati.'
      });
    }

    // 2. Dapatkan tanggal hari ini dalam Waktu Indonesia Barat (WIB / UTC+7)
    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentDay = nowWIB.getDate();
    const currentMonthName = nowWIB.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Mode Uji Coba: jika dibuka dengan parameter ?force=true, abaikan pengecekan tanggal
    const isForceRun = req.query.force === 'true';

    const isReminderDay = [22, 24, 25].includes(currentDay);

    if (!isReminderDay && !isForceRun) {
      return res.status(200).json({
        success: true,
        message: `Hari ini tanggal ${currentDay} WIB (bukan jadwal pengingat H-3, H-1, atau hari H tanggal 25). Cron selesai tanpa pengiriman.`
      });
    }

    // Menentukan sub-header pesan berdasarkan jarak hari
    let urgencyHeader = '⏰ *PENGINGAT JATUH TEMPO SEWA - SMARTKOS*';
    if (currentDay === 22) {
      urgencyHeader = '⏰ *PENGINGAT AWAL (H-3 JATUH TEMPO) - SMARTKOS*';
    } else if (currentDay === 24) {
      urgencyHeader = '⚠️ *PENGINGAT PENTING (BESOK JATUH TEMPO) - SMARTKOS*';
    } else if (currentDay === 25) {
      urgencyHeader = '🚨 *PENGINGAT HARI TERAKHIR (JATUH TEMPO HARI INI) - SMARTKOS*';
    }

    const pendingBillsRes = await sql`
      SELECT 
        b.id, 
        b.nominal, 
        b.due_date, 
        b.ref_id, 
        u.id AS user_id, 
        u.name, 
        u.phone, 
        r.number AS room_number
      FROM bills b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON (u.room_id = r.id OR u.room_id::text = r.number::text)
      WHERE b.status = 'pending'
      ORDER BY b.id ASC
    `;

    const pendingBills = pendingBillsRes.rows;

    if (pendingBills.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Tidak ada tagihan yang berstatus pending (semua anak kos lunas!).'
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const sendLogs = [];

    for (const bill of pendingBills) {
      if (!bill.phone || !bill.phone.trim()) {
        sendLogs.push(`User ${bill.name} dilewati (tidak ada nomor WhatsApp).`);
        failedCount++;
        continue;
      }

      const reminderMessage = 
`${urgencyHeader}

Halo Kak *${bill.name}*,
Semoga hari Anda menyenangkan! Ini adalah pengingat otomatis bahwa masa sewa kamar kos Anda akan/telah jatuh tempo:

🏠 *Kamar:* Kamar ${bill.room_number || '-'}
📅 *Batas Pembayaran:* 25 ${currentMonthName}
💰 *Total Tagihan:* Rp ${Number(bill.nominal).toLocaleString('id-ID')}
📄 *Invoice:* ${bill.ref_id}

Agar sistem smart lock sidik jari di pintu kamar tetap aktif tanpa kendala penguncian otomatis, silakan lakukan pembayaran melalui menu Beranda di website SmartKos:
👉 https://smart-kos-two.vercel.app

_Pesan ini terkirim otomatis oleh sistem. Abaikan jika Kakak sudah menyelesaikan pembayaran. Terima kasih atas kerja samanya!_

Salam hangat,
*Manajemen SmartKos*`;

      try {
        const sendResult = await sendFonnteMessage(fonnteToken, bill.phone, reminderMessage);
        
        await sql`
          INSERT INTO logs (user_id, action) 
          VALUES (${bill.user_id || 0}, ${'Cron Otomatis: WA Pengingat terkirim ke ' + bill.name + ' (' + bill.phone + ')'})
        `;

        sentCount++;
        sendLogs.push(`Sukses kirim ke ${bill.name} (${bill.phone})`);

        // Beri jeda 1.5 detik antar pesan agar nomor WhatsApp tidak dianggap spam oleh server Fonnte
        await sleep(1500);
      } catch (err) {
        failedCount++;
        sendLogs.push(`Gagal kirim ke ${bill.name}: ${err?.message}`);
      }
    }

    await sql`
      INSERT INTO logs (user_id, action) 
      VALUES (0, ${`Sistem Cron Otomatis Selesai: ${sentCount} terkirim, ${failedCount} gagal.`})
    `;

    return res.status(200).json({
      success: true,
      timestamp: nowWIB.toISOString(),
      summary: {
        totalPending: pendingBills.length,
        sent: sentCount,
        failed: failedCount,
        forceMode: isForceRun
      },
      details: sendLogs
    });

  } catch (error) {
    console.error('[CRON ERROR]:', error);
    try {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'CRON ERROR: ' + error.message})`;
    } catch (e) {}

    return res.status(500).json({
      success: false,
      message: error?.message || 'Terjadi kesalahan pada server saat mengeksekusi Cron.'
    });
  }
}