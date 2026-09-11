import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // TokoPay biasa mengirim notif lunas lewat metode POST
  if (req.method === 'POST') {
    const { ref_id, status } = req.body;
    
    if (status === 'Success' || status === 'Sukses' || status === 'Paid') {
       try {
         // 1. Update status tagihan jadi Lunas
         await sql`UPDATE bills SET status = 'lunas' WHERE ref_id = ${ref_id}`;
         
         // 2. Aktifkan kembali sidik jari user (Buka Blokir)
         const billInfo = await sql`SELECT user_id FROM bills WHERE ref_id = ${ref_id}`;
         if(billInfo.rows.length > 0) {
            await sql`UPDATE users SET is_fingerprint_active = true WHERE id = ${billInfo.rows[0].user_id}`;
         }
         return res.status(200).send('OK');
       } catch(e) {
         return res.status(500).send('DB Error');
       }
    }
  }
  res.status(200).send('OK - Data Received');
}