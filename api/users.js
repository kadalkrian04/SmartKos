import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Menambahkan "fingerprint_id" agar admin bisa melihat status alatnya
      const { rows } = await sql`SELECT id, username, name, room_id, active_until, is_fingerprint_active, fingerprint_id FROM users WHERE role = 'resident'`;
      return res.status(200).json(rows);
    }
    
    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}