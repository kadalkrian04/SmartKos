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
    // =========================================================================
    // 1. TAHAP KONFIRMASI PENDAFTARAN SIDIK JARI SUKSES (ENROLL_SUCCESS)
    // =========================================================================
    if (action === 'ENROLL_SUCCESS') {
      // Cari kamar manapun yang sedang dalam sesi perekaman aktif
      const enrollRoomQuery = await sql`
        SELECT id, number, enroll_user_id 
        FROM rooms 
        WHERE enroll_user_id IS NOT NULL 
        ORDER BY enroll_expires_at DESC LIMIT 1
      `;

      const targetUserId = user_id || (enrollRoomQuery.rows.length > 0 ? enrollRoomQuery.rows[0].enroll_user_id : null);
      const targetSlot = slot_id ? slot_id.toString() : (targetUserId ? targetUserId.toString() : '1');

      if (targetUserId) {
        // Simpan nomor slot ID ke database penghuni
        await sql`
          UPDATE users 
          SET fingerprint_id = ${targetSlot}, is_fingerprint_active = true 
          WHERE id = ${targetUserId}
        `;

        // Bersihkan status perekaman di kamar
        await sql`
          UPDATE rooms 
          SET enroll_user_id = NULL, enroll_expires_at = NULL 
          WHERE enroll_user_id = ${targetUserId}
        `;

        // Ambil data kamar penghuni untuk dicatat ke log
        const uRes = await sql`
          SELECT u.name, r.number 
          FROM users u 
          LEFT JOIN rooms r ON u.room_id = r.id 
          WHERE u.id = ${targetUserId}
        `;
        const roomNumber = uRes.rows[0]?.number || 'Uji Coba';

        await sql`
          INSERT INTO logs (user_id, action) 
          VALUES (${targetUserId}, ${'Sidik Jari Berhasil Didaftarkan (Slot #' + targetSlot + '): Kamar ' + roomNumber})
        `;

        return res.status(200).json({ 
          success: true, 
          message: `Sidik jari Penghuni Kamar ${roomNumber} berhasil disimpan di database!` 
        });
      }
    }

    // =========================================================================
    // 2. CEK SESI REKAM JARI (REMOTE ENROLLMENT) DARI WEB
    // Mendukung 1 alat fisik di meja untuk melayani rekam jari kamar manapun!
    // =========================================================================
    const activeEnroll = await sql`
      SELECT id, number, enroll_user_id, enroll_expires_at 
      FROM rooms 
      WHERE enroll_user_id IS NOT NULL AND enroll_expires_at > NOW()
      ORDER BY (CASE WHEN device_id = ${device_id} THEN 0 ELSE 1 END), enroll_expires_at DESC 
      LIMIT 1
    `;

    if (activeEnroll.rows.length > 0) {
      const enrollingRoom = activeEnroll.rows[0];
      return res.status(200).json({
        open: false,
        mode: 'ENROLL',
        slot_id: enrollingRoom.enroll_user_id, // Gunakan User ID sebagai nomor slot sensor
        user_id: enrollingRoom.enroll_user_id,
        message: `Mode rekam aktif! Tempelkan jari untuk Kamar ${enrollingRoom.number}`
      });
    }

    // =========================================================================
    // 3. MODE OPERASIONAL BUKA PINTU BIASA
    // =========================================================================
    if (finger_id === undefined || finger_id <= 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, 'Akses Ditolak: Jari belum terdaftar di sistem')`;
      return res.status(200).json({ open: false, mode: 'NORMAL', message: 'Sidik jari belum terdaftar di sistem' });
    }

    // Cari penghuni pemilik nomor sidik jari ini di tabel users
    const userQuery = await sql`
      SELECT u.id, u.name, u.is_fingerprint_active, u.room_id, r.number AS room_number, r.device_id AS room_device_id
      FROM users u
      LEFT JOIN rooms r ON u.room_id = r.id
      WHERE u.fingerprint_id = ${finger_id.toString()}
    `;

    if (userQuery.rows.length === 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (ID Sensor #' + finger_id + ' Tidak Dikenal)'})`;
      return res.status(200).json({ 
        open: false, 
        mode: 'NORMAL', 
        message: 'Sidik jari tidak cocok dengan data penghuni manapun' 
      });
    }

    const user = userQuery.rows[0];
    const isDirectMatch = user.room_device_id === device_id;
    const roomLabel = user.room_number ? `Kamar ${user.room_number}` : 'Kamar Belum Dipilih';

    // Cek status hak akses & tagihan lunas
    if (user.is_fingerprint_active) {
      const testTag = isDirectMatch ? '' : ' [Uji Coba Multi-Kamar]';
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Buka Pintu Sukses: ' + roomLabel + testTag})`;
      return res.status(200).json({ 
        open: true, 
        mode: 'NORMAL', 
        message: `Akses Diberikan untuk ${user.name} (${roomLabel})` 
      });
    } else {
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Akses Ditolak (Belum Bayar): ' + roomLabel})`;
      return res.status(200).json({ 
        open: false, 
        mode: 'NORMAL', 
        message: `Akses terkunci! Tagihan ${roomLabel} belum lunas` 
      });
    }

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ open: false, message: 'Database Error: ' + error.message });
  }
}