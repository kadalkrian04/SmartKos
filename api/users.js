import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, username, name, room_id, active_until, is_fingerprint_active, fingerprint_id FROM users WHERE role = 'resident'`;
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
      // =========================================================================
      // 1. MEMULAI SESI REKAM JARI JARAK JAUH DARI WEB
      // =========================================================================
      if (action === 'start-enroll') {
        const { userId } = req.body;
        const userRes = await sql`SELECT id, name, room_id, is_fingerprint_active FROM users WHERE id = ${userId}`;
        
        if (userRes.rows.length === 0 || !userRes.rows[0].room_id) {
          return res.status(400).json({ success: false, message: 'Anda belum memilih kamar! Silakan pilih kamar terlebih dahulu.' });
        }
        
        if (!userRes.rows[0].is_fingerprint_active) {
          return res.status(400).json({ 
            success: false, 
            message: 'Akses terkunci! Tagihan kamar Anda belum lunas. Hubungi Admin atau bayar via QRIS terlebih dahulu.' 
          });
        }

        const roomId = userRes.rows[0].room_id;

        // Auto-Fix: Pastikan kolom database tersedia sebelum update
        try {
          await sql`
            UPDATE rooms 
            SET enroll_user_id = ${userId}, enroll_expires_at = NOW() + INTERVAL '90 seconds' 
            WHERE id = ${roomId}
          `;
        } catch (dbColError) {
          // Buat kolom jika belum ada di database Neon
          await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_user_id INT DEFAULT NULL`;
          await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS enroll_expires_at TIMESTAMP DEFAULT NULL`;
          await sql`
            UPDATE rooms 
            SET enroll_user_id = ${userId}, enroll_expires_at = NOW() + INTERVAL '90 seconds' 
            WHERE id = ${roomId}
          `;
        }

        await sql`INSERT INTO logs (user_id, action) VALUES (${userId}, 'Memulai Sesi Rekam Jari Jarak Jauh (Waktu: 90 Detik)')`;
        return res.status(200).json({ 
          success: true, 
          message: 'Sistem pintu siaga! Silakan tempelkan jari Anda ke sensor pintu.' 
        });
      }

      // =========================================================================
      // 2. MEMBATALKAN SESI REKAM JARI
      // =========================================================================
      if (action === 'cancel-enroll') {
        const { userId } = req.body;
        try {
          await sql`UPDATE rooms SET enroll_user_id = NULL, enroll_expires_at = NULL WHERE enroll_user_id = ${userId}`;
        } catch (e) {}
        return res.status(200).json({ success: true, message: 'Sesi pendaftaran dibatalkan' });
      }

      // =========================================================================
      // 3. AKSI PILIH KAMAR
      // =========================================================================
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
    }

    res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}