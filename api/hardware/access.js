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

  const { device_id, finger_id, action, slot_id, user_id } = payload || {};

  if (!device_id) {
    return res.status(400).json({ open: false, message: 'Device ID tidak disertakan' });
  }

  try {
    const roomQuery = await sql`
      SELECT id, number, enroll_user_id, enroll_expires_at 
      FROM rooms 
      WHERE device_id = ${device_id}
    `;

    if (roomQuery.rows.length === 0) {
      return res.status(404).json({ open: false, message: 'Alat belum terhubung ke kamar di dashboard' });
    }
    const room = roomQuery.rows[0];

    if (action === 'ENROLL_SUCCESS') {
      const targetUserId = user_id || room.enroll_user_id;
      const targetSlot = slot_id ? slot_id.toString() : targetUserId.toString();

      // Update ID sidik jari di data penghuni
      await sql`
        UPDATE users 
        SET fingerprint_id = ${targetSlot}, is_fingerprint_active = true 
        WHERE id = ${targetUserId}
      `;

      // Bersihkan mode pendaftaran di kamar
      await sql`
        UPDATE rooms 
        SET enroll_user_id = NULL, enroll_expires_at = NULL 
        WHERE id = ${room.id}
      `;

      // Catat log pendaftaran sukses
      await sql`
        INSERT INTO logs (user_id, action) 
        VALUES (${targetUserId}, ${'Sidik Jari Berhasil Didaftarkan (Slot #' + targetSlot + '): Kamar ' + room.number})
      `;

      return res.status(200).json({ success: true, message: 'Sidik jari berhasil disimpan di database!' });
    }

    const isEnrolling = room.enroll_user_id && room.enroll_expires_at && new Date() < new Date(room.enroll_expires_at);

    if (isEnrolling) {
      // Perintahkan alat ESP8266 untuk langsung masuk ke mode perekaman
      return res.status(200).json({
        open: false,
        mode: 'ENROLL',
        slot_id: room.enroll_user_id,
        user_id: room.enroll_user_id,
        message: 'Mode rekam aktif! Mulai proses pendaftaran jari di sensor.'
      });
    }

    if (finger_id === undefined || finger_id <= 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (Jari Tak Terdaftar): Kamar ' + room.number})`;
      return res.status(200).json({ open: false, mode: 'NORMAL', message: 'Sidik jari belum terdaftar di sistem' });
    }

    const userQuery = await sql`
      SELECT id, name, is_fingerprint_active 
      FROM users 
      WHERE fingerprint_id = ${finger_id.toString()} AND room_id = ${room.id}
    `;

    if (userQuery.rows.length === 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (Bukan Penghuni): Kamar ' + room.number})`;
      return res.status(200).json({ open: false, mode: 'NORMAL', message: 'Sidik jari tidak cocok dengan penghuni kamar ini' });
    }

    const user = userQuery.rows[0];

    if (user.is_fingerprint_active) {
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Buka Pintu Sukses: Kamar ' + room.number})`;
      return res.status(200).json({ open: true, mode: 'NORMAL', message: 'Akses Diberikan' });
    } else {
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Akses Ditolak (Belum Bayar): Kamar ' + room.number})`;
      return res.status(200).json({ open: false, mode: 'NORMAL', message: 'Akses terkunci, tagihan belum lunas' });
    }

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ open: false, message: 'Database Error: ' + error.message });
  }
}