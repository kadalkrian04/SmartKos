import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM rooms ORDER BY number ASC`;
      return res.status(200).json(rows);
    }
    
    if (req.method === 'POST') {
      const { number, name, price } = req.body;
      await sql`INSERT INTO rooms (number, name, price, status) VALUES (${number}, ${name}, ${price}, 'available')`;
      return res.status(200).json({ success: true, message: 'Kamar ditambahkan' });
    }

    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}