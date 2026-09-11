import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM bills ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }
    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}