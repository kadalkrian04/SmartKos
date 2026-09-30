import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const action = req.query.action || (req.url.includes('login') ? 'login' : 'register');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method tidak diizinkan' });
  }

  // Pastikan kolom baru (address, email, phone) tersedia di database
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT ''`;
  } catch (migErr) {}

  // LOGIKA LOGIN
  if (action === 'login') {
    const { username, password } = req.body;
    try {
      const { rows } = await sql`
        SELECT * FROM users 
        WHERE username = ${username} AND password = ${password}
      `;
      if (rows.length > 0) {
        return res.status(200).json({ success: true, user: rows[0] });
      } else {
        return res.status(200).json({ success: false, message: 'Username atau password salah!' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
    }
  }

  // LOGIKA REGISTER DENGAN FIELD LENGKAP
  if (action === 'register') {
    const { name, username, password, address, email, phone } = req.body;
    try {
      const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existing.rows.length > 0) {
        return res.status(200).json({ success: false, message: 'Username sudah dipakai' });
      }
      
      await sql`
        INSERT INTO users (role, username, password, name, address, email, phone) 
        VALUES ('resident', ${username}, ${password}, ${name}, ${address || ''}, ${email || ''}, ${phone || ''})
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // LOGIKA UPDATE PROFIL PENGHUNI
  if (action === 'update-profile') {
    const { userId, name, address, email, phone, password } = req.body;
    try {
      if (password && password.trim() !== '') {
        await sql`
          UPDATE users 
          SET name = ${name}, address = ${address || ''}, email = ${email || ''}, phone = ${phone || ''}, password = ${password}
          WHERE id = ${userId}
        `;
      } else {
        await sql`
          UPDATE users 
          SET name = ${name}, address = ${address || ''}, email = ${email || ''}, phone = ${phone || ''}
          WHERE id = ${userId}
        `;
      }

      const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;
      return res.status(200).json({ success: true, user: rows[0], message: 'Profil berhasil diperbarui!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(404).json({ message: 'Aksi auth tidak ditemukan' });
}