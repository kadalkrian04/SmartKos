import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // 1. SISTEM AUTO-BLOCK 7 HARI TERLAMBAT
      // Query ini akan otomatis mencabut sidik jari user jika tagihan pending dan umurnya sudah lebih dari 7 hari
      await sql`
        UPDATE users SET is_fingerprint_active = false 
        WHERE id IN (
          SELECT user_id FROM bills 
          WHERE status = 'pending' AND CURRENT_DATE > (created_at + INTERVAL '7 days')
        )
      `;
      // 2. Tampilkan semua tagihan
      const { rows } = await sql`SELECT * FROM bills ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }
    
    if (req.method === 'POST') {
      // Generate tagihan otomatis untuk semua user yang punya kamar, mengikuti harga kamar terkini
      await sql`
        INSERT INTO bills (user_id, nominal, month, due_date, ref_id)
        SELECT u.id, r.price, TO_CHAR(CURRENT_DATE, 'Month YYYY'), CURRENT_DATE + INTERVAL '7 days', 'INV-' || u.id || '-' || EXTRACT(EPOCH FROM NOW())::INT
        FROM users u JOIN rooms r ON u.room_id = r.id
        WHERE u.role = 'resident'
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      // Edit nominal manual
      const { nominal } = req.body;
      await sql`UPDATE bills SET nominal = ${nominal} WHERE id = ${req.query.id}`;
      return res.status(200).json({ success: true });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
}