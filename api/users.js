import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, role, username, name, address, email, phone, room_id, active_until, is_fingerprint_active, fingerprint_id, created_at 
        FROM users 
        WHERE role != 'admin' OR role IS NULL 
        ORDER BY id ASC
      `;
      return res.status(200).json(rows);
    }

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

    if (req.method === 'POST') {
      if (action === 'start-enroll') {
        const { userId } = req.body;
        const userRes = await sql`SELECT id, name, room_id, is_fingerprint_active FROM users WHERE id = ${userId}`;
        
        if (userRes.rows.length === 0 || !userRes.rows[0].room_id) {
          return res.status(400).json({ success: false, message: 'Anda belum memilih kamar! Silakan pilih kamar terlebih dahulu.' });
        }
        
        if (!userRes.rows[0].is_fingerprint_active) {
          return res.status(400).json({ 
            success: false, 
            message: 'Akses terkunci! Tagihan kamar belum lunas. Silakan bayar tagihan terlebih dahulu.' 
          });
        }

        const roomId = userRes.rows[0].room_id;

        try {
          await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_user_id INT DEFAULT NULL`;
          await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_expires_at TIMESTAMP DEFAULT NULL`;
        } catch (migErr) {}

        await sql`UPDATE users SET fingerprint_id = NULL WHERE id = ${userId}`;

        await sql`
          UPDATE rooms 
          SET enroll_user_id = ${userId}, enroll_expires_at = NOW() + INTERVAL '90 seconds' 
          WHERE id = ${roomId}
        `;

        await sql`INSERT INTO logs (user_id, action) VALUES (${userId}, 'Memulai Sesi Rekam Jari Jarak Jauh (Siaga 90 Detik)')`;
        
        return res.status(200).json({ 
          success: true, 
          message: 'Sistem pintu siaga! Silakan tempelkan jari Anda ke sensor pintu.' 
        });
      }

      if (action === 'cancel-enroll') {
        const { userId } = req.body;
        try {
          await sql`UPDATE rooms SET enroll_user_id = NULL, enroll_expires_at = NULL WHERE enroll_user_id = ${userId}`;
        } catch (e) {}
        return res.status(200).json({ success: true, message: 'Sesi pendaftaran dibatalkan' });
      }

      if (action === 'choose-room') {
        const { userId, roomId } = req.body;
        const roomData = await sql`SELECT price, number FROM rooms WHERE id = ${roomId} AND status = 'available'`;
        if (roomData.rows.length === 0) {
          return res.status(400).json({ success: false, message: 'Maaf, kamar ini sudah tidak tersedia.' });
        }
        const roomPrice = roomData.rows[0].price;

        await sql`UPDATE users SET room_id = ${roomId} WHERE id = ${userId}`;
        await sql`UPDATE rooms SET status = 'occupied', resident_id = ${userId} WHERE id = ${roomId}`;

        // Pastikan kolom payment_method ada
        try {
          await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'QRIS'`;
        } catch (colErr) {}

        // Format ADIBKOS-[USER_ID]-[TIMESTAMP]
        const refId = `ADIBKOS-${userId}-${Math.floor(Date.now() / 1000)}`;
        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id, payment_method)
          VALUES (${userId}, ${roomPrice}, TO_CHAR(CURRENT_DATE, 'Month YYYY'), CURRENT_DATE + INTERVAL '1 days', ${refId}, 'QRIS')
        `;

        return res.status(200).json({ success: true, message: 'Berhasil memilih kamar dan tagihan telah dibuat' });
      }
    }

    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}