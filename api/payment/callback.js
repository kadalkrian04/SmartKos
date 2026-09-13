import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    let payload = req.method === 'POST' ? req.body : req.query;
    if (typeof payload === 'string') {
       try { payload = JSON.parse(payload); } catch(e) {}
    }

    // Ubah SEMUA laporan TokoPay jadi satu teks panjang
    const payloadString = JSON.stringify(payload);

    // 1. Catat laporan masuk ke Log Admin
    try {
       await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK MASUK: ' + payloadString.substring(0, 220)})`;
    } catch(e) {}

    // 2. JURUS REGEX: Tarik paksa teks yang polanya "INV-(angka)-(angka)" dari manapun posisinya!
    const invMatch = payloadString.match(/INV-\d+-\d+/);
    let ref_id = invMatch ? invMatch[0] : null;

    // 3. Deteksi status sukses dari teks panjang
    const pLower = payloadString.toLowerCase();
    const isSuccess = pLower.includes('success') || pLower.includes('sukses') || pLower.includes('paid') || pLower.includes('settlement');

    // 4. JIKA KETEMU INVOICE DAN STATUS SUKSES
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
    
    // 5. Wajib balas pesan TokoPay
    return res.status(200).json({ success: true, message: 'Laporan Diterima' });

  } catch(e) {
    try { await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK ERROR: ' + e.message})`; } catch(err){}
    return res.status(500).json({ success: false, message: e.message });
  }
}