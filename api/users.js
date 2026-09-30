import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Urutkan akun baru terdaftar (id terbaru) di paling atas
      const { rows } = await sql`
        SELECT id, role, name, username, room_id, active_until, is_fingerprint_active, fingerprint_id, address, email, phone, created_at 
        FROM users 
        ORDER BY id DESC
      `;
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    }

    if (req.method === 'POST') {
      const action = req.query.action;
      const { userId, roomId } = req.body;

      // 1. Aksi Admin Membuat Pengguna Baru Secara Manual
      if (action === 'admin-create') {
        const { name, username, password, address, email, phone, room_id } = req.body;
        if (!name || !username) {
          return res.status(400).json({ success: false, message: 'Nama dan username wajib diisi' });
        }

        const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
        if (existing.rows.length > 0) {
          return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh pengguna lain' });
        }

        const pwd = password && password.trim() !== '' ? password : 'user123';
        const targetRoomId = room_id ? parseInt(room_id, 10) : null;

        const insertUser = await sql`
          INSERT INTO users (role, name, username, password, address, email, phone, room_id, is_fingerprint_active)
          VALUES ('resident', ${name}, ${username}, ${pwd}, ${address || ''}, ${email || ''}, ${phone || ''}, ${targetRoomId}, ${targetRoomId ? true : false})
          RETURNING id
        `;

        const newUserId = insertUser.rows[0]?.id;

        if (targetRoomId && newUserId) {
          await sql`UPDATE rooms SET status = 'occupied', resident_id = ${newUserId} WHERE id = ${targetRoomId}`;
          await sql`INSERT INTO logs (user_id, action) VALUES (${newUserId}, ${'Admin mendaftarkan akun dan menetapkan kamar #' + targetRoomId})`;
        } else if (newUserId) {
          await sql`INSERT INTO logs (user_id, action) VALUES (${newUserId}, 'Admin mendaftarkan akun penghuni baru')`;
        }

        return res.status(200).json({ success: true, message: 'Pengguna baru berhasil ditambahkan' });
      }

      if (action === 'choose-room') {
        const roomRes = await sql`SELECT price, number FROM rooms WHERE id = ${roomId}`;
        if (roomRes.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
        }
        const room = roomRes.rows[0];

        await sql`UPDATE users SET room_id = ${roomId} WHERE id = ${userId}`;
        await sql`UPDATE rooms SET status = 'occupied', resident_id = ${userId} WHERE id = ${roomId}`;

        const refId = `ADIBKOS-${userId}-${Math.floor(Date.now() / 1000)}`;
        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id, payment_method, status)
          VALUES (
            ${userId}, 
            ${room.price}, 
            TO_CHAR(CURRENT_DATE, 'Month YYYY'), 
            CASE 
              WHEN EXTRACT(DAY FROM CURRENT_DATE) <= 25 
              THEN (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '24 days')::DATE
              ELSE (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days')::DATE
            END, 
            ${refId}, 
            'QRIS', 
            'pending'
          )
        `;

        await sql`INSERT INTO logs (user_id, action) VALUES (${userId}, ${'Memesan Kamar ' + room.number + ' (Menunggu Pembayaran)'})`;
        return res.status(200).json({ success: true, message: 'Kamar berhasil dipilih' });
      }

      if (action === 'start-enroll') {
        const userRes = await sql`SELECT room_id FROM users WHERE id = ${userId}`;
        const roomIdVal = userRes.rows[0]?.room_id;
        if (!roomIdVal) {
          return res.status(400).json({ success: false, message: 'Pilih kamar terlebih dahulu' });
        }

        await sql`
          UPDATE rooms 
          SET enroll_user_id = ${userId}, enroll_expires_at = NOW() + INTERVAL '2 minutes' 
          WHERE id = ${roomIdVal}
        `;
        return res.status(200).json({ success: true, message: 'Mode rekam sidik jari diaktifkan' });
      }

      if (action === 'cancel-enroll') {
        await sql`
          UPDATE rooms 
          SET enroll_user_id = NULL, enroll_expires_at = NULL 
          WHERE enroll_user_id = ${userId}
        `;
        return res.status(200).json({ success: true, message: 'Perekaman dibatalkan' });
      }
    }

    if (req.method === 'PUT') {
      const { userId, fingerprint_id, is_fingerprint_active, room_id, name, username, phone, email, address, password } = req.body;

      // 1. Update Profil Pengguna Lengkap oleh Admin
      if (name || username || phone !== undefined || email !== undefined || address !== undefined || room_id !== undefined || password) {
        if (password && password.trim() !== '') {
          await sql`
            UPDATE users 
            SET name = COALESCE(${name}, name),
                username = COALESCE(${username}, username),
                phone = COALESCE(${phone}, phone),
                email = COALESCE(${email}, email),
                address = COALESCE(${address}, address),
                password = ${password},
                room_id = ${room_id !== undefined ? (room_id ? parseInt(room_id, 10) : null) : null}
            WHERE id = ${userId}
          `;
        } else {
          await sql`
            UPDATE users 
            SET name = COALESCE(${name}, name),
                username = COALESCE(${username}, username),
                phone = COALESCE(${phone}, phone),
                email = COALESCE(${email}, email),
                address = COALESCE(${address}, address),
                room_id = ${room_id !== undefined ? (room_id ? parseInt(room_id, 10) : null) : null}
            WHERE id = ${userId}
          `;
        }

        // Sinkronisasi status kamar jika kamar dipindahkan atau dilepas
        if (room_id !== undefined) {
          const targetRoom = room_id ? parseInt(room_id, 10) : null;
          // Kosongkan kamar lama user jika sebelumnya menempati kamar lain
          await sql`UPDATE rooms SET status = 'available', resident_id = NULL WHERE resident_id = ${userId} AND id != ${targetRoom || 0}`;
          if (targetRoom) {
            await sql`UPDATE rooms SET status = 'occupied', resident_id = ${userId} WHERE id = ${targetRoom}`;
          }
        }

        return res.status(200).json({ success: true, message: 'Data pengguna berhasil diperbarui' });
      }

      if (fingerprint_id !== undefined && is_fingerprint_active !== undefined) {
        await sql`
          UPDATE users 
          SET fingerprint_id = ${fingerprint_id}, is_fingerprint_active = ${is_fingerprint_active} 
          WHERE id = ${userId}
        `;
        return res.status(200).json({ success: true, message: 'Sidik jari berhasil diperbarui' });
      }

      if (fingerprint_id === null) {
        await sql`UPDATE users SET fingerprint_id = NULL WHERE id = ${userId}`;
        return res.status(200).json({ success: true, message: 'Sidik jari berhasil dihapus' });
      }

      if (room_id !== undefined) {
        await sql`UPDATE users SET room_id = ${room_id} WHERE id = ${userId}`;
        return res.status(200).json({ success: true, message: 'Kamar user berhasil diubah' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, message: 'User ID wajib disertakan' });

      // Lepaskan kamar yang ditempati
      await sql`UPDATE rooms SET status = 'available', resident_id = NULL WHERE resident_id = ${id} OR id IN (SELECT room_id FROM users WHERE id = ${id})`;
      // Bersihkan tagihan dan hapus pengguna
      await sql`DELETE FROM bills WHERE user_id = ${id}`;
      await sql`DELETE FROM users WHERE id = ${id}`;

      return res.status(200).json({ success: true, message: 'Pengguna berhasil dihapus permanen' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}