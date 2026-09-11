import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Ambil 50 log terakhir
      const { rows } = await sql`SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50`;
      return res.status(200).json(rows);
    }
    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}