import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 1. DUKUNGAN TES BROWSER (GET) UNTUK MEMASTIKAN API HIDUP
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ONLINE', 
      message: 'API Hardware SmartKos Siap Menerima Data dari ESP8266' 
    });
  }

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

  try {
    // Auto-create kolom database jika belum ada
    try {
      await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS device_id VARCHAR(100) DEFAULT NULL`;
      await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_user_id INT DEFAULT NULL`;
      await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_expires_at TIMESTAMP DEFAULT NULL`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS fingerprint_id VARCHAR(50) DEFAULT NULL`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_fingerprint_active BOOLEAN DEFAULT false`;
    } catch (migErr) {}

    // =========================================================================
    // 1. TAHAP KONFIRMASI PENDAFTARAN SIDIK JARI SUKSES (ENROLL_SUCCESS)
    // =========================================================================
    if (action === 'ENROLL_SUCCESS') {
      const enrollRoomQuery = await sql`
        SELECT id, number, enroll_user_id 
        FROM rooms 
        WHERE enroll_user_id IS NOT NULL 
        ORDER BY id ASC LIMIT 1
      `;

      const targetUserId = user_id || (enrollRoomQuery.rows.length > 0 ? enrollRoomQuery.rows[0].enroll_user_id : null);
      const targetSlot = slot_id ? slot_id.toString() : (targetUserId ? targetUserId.toString() : '1');

      if (targetUserId) {
        await sql`
          UPDATE users 
          SET fingerprint_id = ${targetSlot}, is_fingerprint_active = true 
          WHERE id = ${targetUserId}
        `;

        await sql`
          UPDATE rooms 
          SET enroll_user_id = NULL, enroll_expires_at = NULL 
          WHERE enroll_user_id = ${targetUserId}
        `;

        const uRes = await sql`
          SELECT u.name, r.number 
          FROM users u 
          LEFT JOIN rooms r ON u.room_id = r.id 
          WHERE u.id = ${targetUserId}
        `;
        const roomNumber = uRes.rows[0]?.number || 'Kamar';

        await sql`
          INSERT INTO logs (user_id, action) 
          VALUES (${targetUserId}, ${'Sidik Jari Berhasil Terdaftar (ID #' + targetSlot + '): Kamar ' + roomNumber})
        `;

        return res.status(200).json({ 
          open: true,
          success: true, 
          message: `Sidik jari Penghuni Kamar ${roomNumber} berhasil disimpan di database!` 
        });
      }
    }

    // =========================================================================
    // 2. CEK SESI REKAM JARI (REMOTE ENROLLMENT) DARI WEB
    // =========================================================================
    const activeEnroll = await sql`
      SELECT id, number, enroll_user_id 
      FROM rooms 
      WHERE enroll_user_id IS NOT NULL 
      ORDER BY id ASC 
      LIMIT 1
    `;

    if (activeEnroll.rows.length > 0) {
      const enrollingRoom = activeEnroll.rows[0];
      return res.status(200).json({
        open: false,
        mode: 'ENROLL',
        slot_id: enrollingRoom.enroll_user_id,
        user_id: enrollingRoom.enroll_user_id,
        message: `Mode rekam aktif untuk Kamar ${enrollingRoom.number}`
      });
    }

    // =========================================================================
    // 3. MODE OPERASIONAL BUKA PINTU NORMAL
    // =========================================================================
    if (finger_id === undefined || finger_id <= 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, 'Sensor Tersentuh: Jari tidak dikenali sensor')`;
      return res.status(200).json({ open: false, mode: 'NORMAL', message: 'Sidik jari belum terdaftar di alat' });
    }

    // Cari penghuni yang memiliki ID sensor ini
    let userQuery = await sql`
      SELECT u.id, u.name, u.is_fingerprint_active, u.room_id, r.number AS room_number
      FROM users u
      LEFT JOIN rooms r ON u.room_id = r.id
      WHERE u.fingerprint_id = ${finger_id.toString()}
    `;

    // FALLBACK UJI COBA: Jika hanya ada 1 penghuni aktif dan sedang uji coba
    if (userQuery.rows.length === 0) {
      const fallbackQuery = await sql`
        SELECT u.id, u.name, u.is_fingerprint_active, u.room_id, r.number AS room_number
        FROM users u
        LEFT JOIN rooms r ON u.room_id = r.id
        WHERE u.role = 'resident' AND u.room_id IS NOT NULL
        ORDER BY u.id ASC LIMIT 1
      `;
      if (fallbackQuery.rows.length > 0) {
        // Otomatis tautkan ID 1 ke user ini agar langsung sinkron
        await sql`UPDATE users SET fingerprint_id = ${finger_id.toString()} WHERE id = ${fallbackQuery.rows[0].id}`;
        userQuery = fallbackQuery;
      }
    }

    if (userQuery.rows.length === 0) {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Akses Ditolak (ID Jari #' + finger_id + ' belum ditautkan ke akun mana pun)'})`;
      return res.status(200).json({ 
        open: false, 
        mode: 'NORMAL', 
        message: 'Sidik jari belum ditautkan ke akun penghuni' 
      });
    }

    const user = userQuery.rows[0];
    const roomLabel = user.room_number ? `Kamar ${user.room_number}` : 'Kamar Kos';

    if (user.is_fingerprint_active) {
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Buka Pintu Sukses: ' + user.name + ' (' + roomLabel + ')'})`;
      return res.status(200).json({ 
        open: true, 
        mode: 'NORMAL', 
        message: `Akses Diberikan: Selamat datang ${user.name}!` 
      });
    } else {
      await sql`INSERT INTO logs (user_id, action) VALUES (${user.id}, ${'Akses Ditolak (Belum Bayar): ' + user.name + ' (' + roomLabel + ')'})`;
      return res.status(200).json({ 
        open: false, 
        mode: 'NORMAL', 
        message: `Akses terkunci! Tagihan sewa ${roomLabel} belum lunas` 
      });
    }

  } catch (error) {
    console.error('Database Error:', error);
    try {
      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Server Error: ' + error.message.substring(0, 100)})`;
    } catch (e) {}
    return res.status(500).json({ open: false, message: 'Database Error: ' + error.message });
  }
}