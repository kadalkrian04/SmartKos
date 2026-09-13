import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Tangkap data dari TokoPay (bisa lewat POST body atau GET url)
  const payload = req.method === 'POST' ? req.body : req.query;
  
  // Log untuk mengecek di Vercel jika laporan masuk
  console.log("Menerima Webhook TokoPay:", payload);
  
  const ref_id = payload.ref_id;
  const status = payload.status;
  
  const validStatus = status ? status.toLowerCase() : '';
  
  // Jika TokoPay bilang sukses
  if (validStatus === 'success' || validStatus === 'sukses' || validStatus === 'paid') {
     try {
       // 1. Ubah status tagihan jadi lunas dan cari tahu ini user siapa
       const updateBill = await sql`
          UPDATE bills SET status = 'lunas' 
          WHERE ref_id = ${ref_id} 
          RETURNING user_id
       `;
       
       if(updateBill.rows.length > 0) {
          const userId = updateBill.rows[0].user_id;
          // 2. Aktifkan sidik jari & Perpanjang masa aktif 1 Bulan 7 Hari
          await sql`
            UPDATE users 
            SET is_fingerprint_active = true, 
                active_until = CURRENT_DATE + INTERVAL '1 month 7 days' 
            WHERE id = ${userId}
          `;
       }
       return res.status(200).send('OK');
     } catch(e) {
       console.error("Database Error di Callback:", e);
       return res.status(500).send('DB Error');
     }
  }
  
  res.status(200).send('OK - Data Received');
}