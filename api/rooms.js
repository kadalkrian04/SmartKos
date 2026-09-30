import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // 1. AUTO-HEALING: Otomatis sinkronkan kamar dengan penyewa aktif di tabel users
      try {
        await sql`
          UPDATE rooms r
          SET status = 'occupied', resident_id = u.id
          FROM users u
          WHERE (u.room_id = r.id OR u.room_id::text = r.number::text)
            AND u.role = 'resident'
            AND (r.status != 'occupied' OR r.resident_id IS NULL)
        `;

        await sql`
          UPDATE rooms
          SET status = 'available', resident_id = NULL
          WHERE status = 'occupied'
            AND id NOT IN (
              SELECT room_id FROM users 
              WHERE room_id IS NOT NULL AND role = 'resident'
            )
            AND (resident_id IS NULL OR resident_id NOT IN (
              SELECT id FROM users WHERE role = 'resident'
            ))
        `;
      } catch (syncErr) {
        console.error('Auto-sync rooms error:', syncErr);
      }

      const { rows } = await sql`SELECT * FROM rooms ORDER BY id ASC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { number, name, price } = req.body;
      const deviceId = `KAMAR-${number}`;
      await sql`
        INSERT INTO rooms (number, name, price, status, device_id)
        VALUES (${number}, ${name}, ${parseInt(price, 10)}, 'available', ${deviceId})
      `;
      return res.status(200).json({ success: true, message: 'Kamar berhasil ditambahkan' });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { number, name, price, fingerprint_status, device_id, status } = req.body;

      if (fingerprint_status !== undefined) {
        await sql`UPDATE rooms SET fingerprint_status = ${fingerprint_status} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Status fingerprint diperbarui' });
      }

      if (device_id !== undefined) {
        await sql`UPDATE rooms SET device_id = ${device_id} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Device ID diperbarui' });
      }

      if (status !== undefined) {
        await sql`UPDATE rooms SET status = ${status} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Status kamar diperbarui' });
      }

      if (number && name && price) {
        await sql`
          UPDATE rooms 
          SET number = ${number}, name = ${name}, price = ${parseInt(price, 10)} 
          WHERE id = ${id}
        `;
        return res.status(200).json({ success: true, message: 'Data kamar berhasil diperbarui' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`UPDATE users SET room_id = NULL WHERE room_id = ${parseInt(id, 10)}`;
      await sql`DELETE FROM rooms WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Kamar berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}