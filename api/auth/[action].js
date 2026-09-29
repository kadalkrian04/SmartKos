import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const action = req.query.action || (req.url.includes('login') ? 'login' : 'register');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method tidak diizinkan' });
  }

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

  // LOGIKA REGISTER
  if (action === 'register') {
    const { name, username, password } = req.body;
    try {
      const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existing.rows.length > 0) {
        return res.status(200).json({ success: false, message: 'Username sudah dipakai' });
      }
      
      await sql`INSERT INTO users (role, username, password, name) VALUES ('resident', ${username}, ${password}, ${name})`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(404).json({ message: 'Aksi auth tidak ditemukan' });
}