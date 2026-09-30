import { sql } from '@vercel/postgres';

async function sendFonnteMessage(token, targetPhone, messageText) {
  if (!token || !targetPhone || !messageText) {
    throw new Error('Token Fonnte, nomor tujuan, dan teks pesan wajib diisi');
  }

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

  const resData = await response.json();
  return resData;
}

export default async function handler(req, res) {
  try {
    const action = req.query.action || 'test';

    const settingRes = await sql`SELECT key_value FROM settings WHERE key_name = 'fonnte_token'`;
    const fonnteToken = settingRes.rows[0]?.key_value;

    if (action === 'test') {
      if (!fonnteToken || !fonnteToken.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Token Fonnte belum dikonfigurasi di menu Pengaturan'
        });
      }

      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Nomor WhatsApp tujuan tes wajib diisi'
        });
      }

      const testMsg = 
`✅ *TES KONEKSI SMARTKOS WHATSAPP GATEWAY*

Halo Pengelola SmartKos!
Integrasi WhatsApp API Gateway via *Fonnte* telah berhasil terhubung dengan sempurna.

Waktu Uji: ${new Date().toLocaleString('id-ID')}
Sistem: SmartKos Management System`;

      const result = await sendFonnteMessage(fonnteToken, phone, testMsg);

      if (result.status === true || result.status === 'true' || result.id) {
        return res.status(200).json({ success: true, message: 'Pesan tes berhasil dikirim!', data: result });
      } else {
        return res.status(400).json({ success: false, message: result.reason || 'Gagal mengirim pesan dari Fonnte' });
      }
    }

    if (action === 'send-reminder') {
      const { bill_id } = req.body;
      if (!bill_id) {
        return res.status(400).json({ success: false, message: 'ID Tagihan wajib disertakan' });
      }

      if (!fonnteToken || !fonnteToken.trim()) {
        return res.status(400).json({ success: false, message: 'Token Fonnte belum diatur di Pengaturan' });
      }

      const billRes = await sql`
        SELECT b.id, b.nominal, b.due_date, b.ref_id, u.name, u.phone, r.number AS room_number
        FROM bills b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN rooms r ON (u.room_id = r.id OR u.room_id::text = r.number::text)
        WHERE b.id = ${bill_id}
      `;

      if (billRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Data tagihan tidak ditemukan' });
      }

      const bill = billRes.rows[0];
      if (!bill.phone || !bill.phone.trim()) {
        return res.status(400).json({ success: false, message: 'Penghuni belum memiliki nomor WhatsApp terdaftar' });
      }

      const d = bill.due_date ? new Date(bill.due_date) : new Date();
      const mName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

      const reminderMsg = 
`⏰ *PENGINGAT JATUH TEMPO - ADIBJAYAKOS*

Halo Kak *${bill.name}*,
Ini adalah pengingat bahwa masa sewa kamar kos Anda akan jatuh tempo:

🏠 *Kamar:* Kamar ${bill.room_number || '-'}
📅 *Batas Pembayaran:* 25 ${mName}
💰 *Total Tagihan:* Rp ${Number(bill.nominal).toLocaleString('id-ID')}
📄 *Invoice:* ${bill.ref_id}

Untuk menghindari penguncian otomatis akses pintu sidik jari, silakan lakukan pembayaran melalui menu Beranda di website SmartKos:
👉 https://smart-kos-two.vercel.app

_Abaikan pesan ini apabila Anda sudah melakukan pembayaran. Terima kasih atas kerja samanya!_

Salam hangat,
*ADIB JAYAKOS*`;

      const result = await sendFonnteMessage(fonnteToken, bill.phone, reminderMsg);

      await sql`
        INSERT INTO logs (user_id, action) 
        VALUES (0, ${'Pengingat WA terkirim ke ' + bill.name + ' (' + bill.phone + ') untuk Invoice ' + bill.ref_id})
      `;

      return res.status(200).json({
        success: true,
        message: `Pesan pengingat berhasil dikirim ke WhatsApp ${bill.name}`,
        data: result
      });
    }

    return res.status(404).json({ message: 'Aksi WhatsApp tidak ditemukan' });
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Server error' });
  }
}