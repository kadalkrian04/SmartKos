import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Pastikan kolom payment_method tersedia
    try {
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'QRIS'`;
    } catch (e) {}

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM bills ORDER BY id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const activeResidents = await sql`
        SELECT u.id, u.name, r.price, r.number 
        FROM users u 
        JOIN rooms r ON u.room_id = r.id 
        WHERE u.role = 'resident'
      `;

      let createdCount = 0;
      for (const resUser of activeResidents.rows) {
        const refId = `ADIBKOS-${resUser.id}-${Math.floor(Date.now() / 1000)}`;
        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id, payment_method)
          VALUES (
            ${resUser.id}, 
            ${resUser.price}, 
            TO_CHAR(CURRENT_DATE, 'Month YYYY'), 
            CURRENT_DATE + INTERVAL '5 days', 
            ${refId},
            'QRIS'
          )
        `;
        createdCount++;
      }

      await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'Membuat otomatis ' + createdCount + ' tagihan bulanan (ADIBKOS)'})`;
      return res.status(200).json({ success: true, message: `${createdCount} tagihan bulanan berhasil dibuat` });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { action, user_id, nominal, payment_method } = req.body;

      if (action === 'set_lunas') {
        const targetMethod = payment_method || 'Tunai / Manual';
        await sql`
          UPDATE bills 
          SET status = 'lunas', payment_method = ${targetMethod} 
          WHERE id = ${id}
        `;

        if (user_id) {
          await sql`
            UPDATE users 
            SET is_fingerprint_active = true, 
                active_until = CURRENT_DATE + INTERVAL '30 days' 
            WHERE id = ${user_id}
          `;
          await sql`INSERT INTO logs (user_id, action) VALUES (${user_id}, ${'Tagihan #' + id + ' dilunasi manual (' + targetMethod + ')'})`;
        }

        return res.status(200).json({ success: true, message: 'Tagihan berhasil ditandai Lunas' });
      }

      if (nominal !== undefined) {
        await sql`UPDATE bills SET nominal = ${parseInt(nominal, 10)} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Nominal tagihan diperbarui' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM bills WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Riwayat berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}