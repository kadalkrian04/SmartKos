import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      try {
         await sql`DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '7 days'`;
      } catch(e) { console.error("Gagal auto-hapus log", e); }

      const { rows } = await sql`SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50`;
      return res.status(200).json(rows);
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM logs`;
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}