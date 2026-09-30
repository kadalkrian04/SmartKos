import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS bills (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          nominal INT NOT NULL,
          month VARCHAR(50) NOT NULL,
          due_date DATE NOT NULL,
          ref_id VARCHAR(100) NOT NULL UNIQUE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(50) DEFAULT 'QRIS',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'QRIS'`;
    } catch (migErr) {
      console.error('Migrasi tabel bills:', migErr);
    }

    if (req.method === 'GET') {
      try {
        // AUTO-HEAL: Pastikan semua tanggal jatuh tempo di database terkoreksi ke tanggal 25
        await sql`
          UPDATE bills
          SET due_date = (DATE_TRUNC('month', due_date) + INTERVAL '24 days')::DATE
          WHERE due_date IS NOT NULL 
            AND EXTRACT(DAY FROM due_date) != 25
        `;
      } catch (syncErr) {
        console.error('Auto-heal due_date error:', syncErr);
      }

      const { rows } = await sql`
        SELECT id, user_id, nominal, month, due_date, ref_id, status, payment_method, created_at 
        FROM bills 
        ORDER BY id DESC
      `;
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    }

    if (req.method === 'POST') {
      // Ambil seluruh penyewa aktif yang sudah memiliki kamar
      const residents = await sql`
        SELECT u.id, u.name, u.room_id, r.number, r.price 
        FROM users u 
        INNER JOIN rooms r ON (u.room_id = r.id OR u.room_id::text = r.number::text)
        WHERE u.role = 'resident'
      `;

      for (const resident of residents.rows) {
        const refId = `ADIBKOS-${resident.id}-${Math.floor(Date.now() / 1000)}`;
        const price = resident.price || 500000;

        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id, payment_method, status)
          VALUES (
            ${resident.id},
            ${price},
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

        await sql`
          INSERT INTO logs (user_id, action) 
          VALUES (${resident.id}, ${'Tagihan baru dibuat untuk Kamar ' + resident.number + ' (Jatuh tempo tgl 25)'})
        `;
      }

      return res.status(200).json({ success: true, message: 'Tagihan bulan ini berhasil dibuat' });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { action, nominal, user_id, payment_method } = req.body;

      // 1. Aksi Set Lunas Manual oleh Admin
      if (action === 'set_lunas') {
        const method = payment_method || 'Tunai / Manual';
        await sql`
          UPDATE bills 
          SET status = 'lunas', payment_method = ${method} 
          WHERE id = ${id}
        `;

        if (user_id) {
          await sql`
            UPDATE users 
            SET is_fingerprint_active = true,
                active_until = CASE 
                  WHEN EXTRACT(DAY FROM CURRENT_DATE) <= 25 
                  THEN (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '24 days')::DATE
                  ELSE (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days')::DATE
                END
            WHERE id = ${user_id}
          `;
          await sql`INSERT INTO logs (user_id, action) VALUES (${user_id}, ${'Tagihan dilunasi manual (' + method + ')'})`;
        }

        return res.status(200).json({ success: true, message: 'Tagihan berhasil ditandai Lunas' });
      }

      // 2. Aksi Koreksi Metode Pembayaran
      if (payment_method && !nominal) {
        await sql`UPDATE bills SET payment_method = ${payment_method} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Metode pembayaran diperbarui' });
      }

      // 3. Aksi Edit Nominal Tagihan
      if (nominal) {
        await sql`UPDATE bills SET nominal = ${parseInt(nominal, 10)} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Nominal tagihan diperbarui' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM bills WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Tagihan berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    console.error('API Bills Error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}