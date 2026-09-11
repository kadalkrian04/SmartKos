import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM rooms ORDER BY number ASC`;
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { number, name, price } = req.body;
      await sql`INSERT INTO rooms (number, name, price) VALUES (${number}, ${name}, ${price})`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'PUT') {
      const id = req.query.id;
      const { number, name, price, fingerprint_status } = req.body;
      if (fingerprint_status !== undefined) {
          // Update status hardware fingerprint saja
          await sql`UPDATE rooms SET fingerprint_status = ${fingerprint_status} WHERE id = ${id}`;
      } else {
          // Update detail nama, harga dll
          await sql`UPDATE rooms SET number = ${number}, name = ${name}, price = ${price} WHERE id = ${id}`;
      }
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM rooms WHERE id = ${req.query.id} AND status = 'available'`;
      return res.status(200).json({ success: true });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
}