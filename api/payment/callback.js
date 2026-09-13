import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // 1. Ambil data dari TokoPay (bisa POST atau GET)
    let payload = req.method === 'POST' ? req.body : req.query;
    
    // Parse manual jika TokoPay mengirim dalam bentuk Teks String biasa
    if (typeof payload === 'string') {
       try { payload = JSON.parse(payload); } catch(e) {}
    }

    const payloadString = JSON.stringify(payload);

    // 2. SIMPAN LOG KE DATABASE (Agar kamu bisa intip laporan TokoPay di menu Log Pintu)
    try {
       await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK MASUK: ' + payloadString.substring(0, 220)})`;
    } catch(e) {}

    // 3. Sistem Deteksi Otomatis (Mencari Nomor Invoice)
    let ref_id = payload.ref_id || payload.merchant_order_id || payload.reference || payload.order_id || '';
    let status = payload.status || payload.transaction_status || '';
    
    // Jika ref_id tidak ketemu di field standar, paksa cari manual field yang ada kata "INV-"
    if (!ref_id) {
       for (const key in payload) {
          if (typeof payload[key] === 'string' && payload[key].includes('INV-')) {
             ref_id = payload[key];
          }
       }
    }

    const validStatus = String(status).toLowerCase();
    
    // Deteksi status sukses pakai jalur paksa
    const isSuccess = validStatus === 'success' || validStatus === 'sukses' || validStatus === 'paid' || validStatus === 'settlement' || payloadString.toLowerCase().includes('sukses') || payloadString.toLowerCase().includes('success');

    // 4. JIKA KETEMU INVOICE-NYA DAN STATUSNYA SUKSES
    if (ref_id && isSuccess) {
       
       // Update tagihan jadi lunas
       const updateBill = await sql`
          UPDATE bills SET status = 'lunas' 
          WHERE ref_id = ${ref_id} 
          RETURNING user_id
       `;
       
       if (updateBill.rows.length > 0) {
          const userId = updateBill.rows[0].user_id;
          
          // Aktifkan sidik jari & Perpanjang masa aktif 37 Hari (1 bln 7 hr)
          await sql`
            UPDATE users 
            SET is_fingerprint_active = true, 
                active_until = CURRENT_DATE + INTERVAL '37 days' 
            WHERE id = ${userId}
          `;
          
          // Catat di Log Pintu kalau berhasil lunas otomatis
          await sql`INSERT INTO logs (user_id, action) VALUES (${userId}, ${'Pembayaran Otomatis Lunas: ' + ref_id})`;
       }
    }
    
    // 5. Wajib balas pesan TokoPay agar TokoPay berhenti spam notifikasi
    return res.status(200).json({ success: true, message: 'Laporan Diterima' });

  } catch(e) {
    // Catat jika ada error di sistem saat memproses
    try { await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK ERROR: ' + e.message})`; } catch(err){}
    return res.status(500).json({ success: false, message: e.message });
  }
}