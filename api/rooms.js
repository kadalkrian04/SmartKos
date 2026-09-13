import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      try {
        await sql`
          UPDATE rooms SET status = 'available', resident_id = NULL
          WHERE resident_id IN (
              SELECT u.id FROM users u JOIN bills b ON u.id = b.user_id
              WHERE u.active_until IS NULL AND b.status = 'pending' AND b.created_at < NOW() - INTERVAL '10 minutes'
          )
        `;
        await sql`
          UPDATE users SET room_id = NULL
          WHERE active_until IS NULL AND id IN (
              SELECT user_id FROM bills WHERE status = 'pending' AND created_at < NOW() - INTERVAL '10 minutes'
          )
        `;
        await sql`
          DELETE FROM bills
          WHERE status = 'pending' AND created_at < NOW() - INTERVAL '10 minutes'
          AND user_id IN (SELECT id FROM users WHERE active_until IS NULL)
        `;
      } catch (cleanError) {
        console.error("Gagal Auto-Cancel 10 menit", cleanError);
      }

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
      const { number, name, price, fingerprint_status, device_id } = req.body;
      
      if (device_id !== undefined) {
          await sql`UPDATE rooms SET device_id = ${device_id} WHERE id = ${id}`;
      } 
      else if (fingerprint_status !== undefined) {
          await sql`UPDATE rooms SET fingerprint_status = ${fingerprint_status} WHERE id = ${id}`;
      } 
      else {
          await sql`UPDATE rooms SET number = ${number}, name = ${name}, price = ${price} WHERE id = ${id}`;
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      // 1. Lepaskan (Set NULL) semua user yang kamarnya mengarah ke ID ini supaya tidak error Foreign Key
      await sql`UPDATE users SET room_id = NULL WHERE room_id = ${id}`;
      // 2. Baru deh kamarnya dihancurkan
      await sql`DELETE FROM rooms WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
}