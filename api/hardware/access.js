import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  // Menangkap data yang dikirim oleh alat ESP8266 (Device ID kamar dan ID Sidik Jari)
  const { device_id, finger_id } = req.body;

  try {
    const roomQuery = await sql`SELECT id, number FROM rooms WHERE device_id = ${device_id}`;

    if (roomQuery.rows.length === 0) {
        // Alat salah kamar / belum didaftarkan di Dashboard Admin
        return res.status(404).json({ open: false, message: 'Alat tidak terdaftar di kamar manapun' });
    }
    const room = roomQuery.rows[0];

    const userQuery = await sql`
      SELECT id, name, is_fingerprint_active 
      FROM users 
      WHERE fingerprint_id = ${finger_id.toString()} AND room_id = ${room.id}
    `;

    if (userQuery.rows.length === 0) {
       // Jari terdaftar di alat, tapi bukan penghuni kamar ini
       await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (Bukan Penghuni): Kamar ' + room.number})`;
       return res.status(200).json({ open: false, message: 'Jari tidak cocok dengan penghuni kamar ini' });
    }

    const user = userQuery.rows[0];

    if (user.is_fingerprint_active) {
       // Tagihan lunas! Catat log dan suruh alat ESP8266 buka pintu (open: true)
       await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Buka Pintu Sukses: Kamar ' + room.number})`;
       return res.status(200).json({ open: true, message: 'Akses Diberikan' });
    } else {
       // Telat bayar! Catat log dan larang alat ESP8266 buka pintu (open: false)
       await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Akses Ditolak (Belum Bayar): Kamar ' + room.number})`;
       return res.status(200).json({ open: false, message: 'Akses terkunci, tagihan belum lunas' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ open: false, message: 'Server Database Error' });
  }
}