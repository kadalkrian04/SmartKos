import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      console.error('Gagal parse JSON hardware', e);
    }
  }

  const { device_id, finger_id } = payload || {};

  if (!device_id || finger_id === undefined) {
    return res.status(400).json({ open: false, message: 'Data hardware tidak lengkap' });
  }

  try {
    const roomQuery = await sql`SELECT id, number FROM rooms WHERE device_id = ${device_id}`;

    if (roomQuery.rows.length === 0) {
      return res.status(404).json({ open: false, message: 'Alat belum terhubung ke kamar di dashboard' });
    }
    const room = roomQuery.rows[0];

    const userQuery = await sql`
      SELECT id, name, is_fingerprint_active 
      FROM users 
      WHERE fingerprint_id = ${finger_id.toString()} AND room_id = ${room.id}
    `;

    if (userQuery.rows.length === 0) {
      // Jari ada di alat, tetapi bukan penyewa kamar ini
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (Bukan Penghuni): Kamar ' + room.number})`;
      return res.status(200).json({ open: false, message: 'Sidik jari tidak cocok dengan penghuni kamar ini' });
    }

    const user = userQuery.rows[0];

    if (user.is_fingerprint_active) {
      // TAGIHAN LUNAS: Buka pintu dan catat riwayat sukses
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Buka Pintu Sukses: Kamar ' + room.number})`;
      return res.status(200).json({ open: true, message: 'Akses Diberikan' });
    } else {
      // TAGIHAN BELUM LUNAS: Kunci pintu
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Akses Ditolak (Belum Bayar): Kamar ' + room.number})`;
      return res.status(200).json({ open: false, message: 'Akses terkunci, tagihan belum lunas' });
    }

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ open: false, message: 'Database Error: ' + error.message });
  }
}