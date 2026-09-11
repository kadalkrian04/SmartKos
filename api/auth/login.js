import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Hanya menerima metode POST dari form login
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method tidak diizinkan' });
  }

  const { username, password } = req.body;

  try {
    // Mengecek ke database apakah username dan password cocok
    const { rows } = await sql`
      SELECT * FROM users 
      WHERE username = ${username} AND password = ${password}
    `;

    if (rows.length > 0) {
      // Jika ketemu, kirim data user ke depan (sukses)
      res.status(200).json({ success: true, user: rows[0] });
    } else {
      // Jika salah password/username
      res.status(200).json({ success: false, message: 'Username atau password salah!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
  }
}