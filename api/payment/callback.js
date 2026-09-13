import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { ref_id, status } = req.body;
    
    // Log ini akan muncul di Vercel Dashboard agar kita tau jika ada error
    console.log("Menerima Webhook TokoPay:", req.body);
    
    // Memastikan huruf besar/kecil dari TokoPay terbaca dengan benar
    const validStatus = status ? status.toLowerCase() : '';
    
    if (validStatus === 'success' || validStatus === 'sukses' || validStatus === 'paid') {
       try {
         // 1. Ubah status tagihan jadi lunas
         await sql`UPDATE bills SET status = 'lunas' WHERE ref_id = ${ref_id}`;
         
         // 2. Ambil user_id, aktifkan sidik jari & Perpanjang 1 Bulan 7 Hari
         const billInfo = await sql`SELECT user_id FROM bills WHERE ref_id = ${ref_id}`;
         if(billInfo.rows.length > 0) {
            await sql`
              UPDATE users 
              SET is_fingerprint_active = true, 
                  active_until = CURRENT_DATE + INTERVAL '1 month 7 days' 
              WHERE id = ${billInfo.rows[0].user_id}
            `;
         }
         return res.status(200).send('OK');
       } catch(e) {
         console.error("Database Error di Callback:", e);
         return res.status(500).send('DB Error');
       }
    }
  }
  res.status(200).send('OK - Data Received');
}