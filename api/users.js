import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    // 1. AMBIL DATA USERS (GET)
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, username, name, room_id, active_until, is_fingerprint_active, fingerprint_id FROM users WHERE role = 'resident'`;
      return res.status(200).json(rows);
    }

    // 2. UPDATE FINGERPRINT / STATUS AKSES (PUT)
    if (req.method === 'PUT') {
      const { userId, fingerprint_id, is_fingerprint_active } = req.body;

      if (is_fingerprint_active !== undefined) {
        await sql`
          UPDATE users 
          SET 
            fingerprint_id = ${fingerprint_id ? fingerprint_id.toString() : null},
            is_fingerprint_active = ${is_fingerprint_active}
          WHERE id = ${userId}
        `;
      } else {
        await sql`
          UPDATE users 
          SET 
            fingerprint_id = ${fingerprint_id ? fingerprint_id.toString() : null}
          WHERE id = ${userId}
        `;
      }

      return res.status(200).json({ success: true, message: 'Data sidik jari penghuni berhasil diperbarui' });
    }

    // 3. PILIH KAMAR ATAU DAFTAR FINGERPRINT (POST)
    if (req.method === 'POST') {
      // AKSI PILIH KAMAR
      if (action === 'choose-room') {
        const { userId, roomId } = req.body;
        const roomData = await sql`SELECT price, number FROM rooms WHERE id = ${roomId} AND status = 'available'`;
        if (roomData.rows.length === 0) {
          return res.status(400).json({ success: false, message: 'Maaf, kamar ini sudah tidak tersedia.' });
        }
        const roomPrice = roomData.rows[0].price;

        await sql`UPDATE users SET room_id = ${roomId} WHERE id = ${userId}`;
        await sql`UPDATE rooms SET status = 'occupied', resident_id = ${userId} WHERE id = ${roomId}`;

        const refId = `INV-${userId}-${Date.now()}`;
        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id)
          VALUES (${userId}, ${roomPrice}, TO_CHAR(CURRENT_DATE, 'Month YYYY'), CURRENT_DATE + INTERVAL '1 days', ${refId})
        `;

        return res.status(200).json({ success: true, message: 'Berhasil memilih kamar dan tagihan telah dibuat' });
      }

      // AKSI DAFTAR FINGERPRINT
      if (action === 'fingerprint') {
        const { userId } = req.body;
        const user = await sql`SELECT is_fingerprint_active FROM users WHERE id = ${userId}`;
        if(user.rows.length === 0 || !user.rows[0].is_fingerprint_active) {
          return res.status(400).json({ success: false, message: 'Selesaikan tagihan Anda terlebih dahulu!'});
        }

        const hardwareFingerprintId = userId.toString();
        await sql`UPDATE users SET fingerprint_id = ${hardwareFingerprintId} WHERE id = ${userId}`;

        return res.status(200).json({ 
          success: true, 
          fingerprint_id: hardwareFingerprintId, 
          message: 'Akses disetujui! Silakan ikuti panduan pendaftaran pada alat ESP8266 di pintu Anda.' 
        });
      }
    }

    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}