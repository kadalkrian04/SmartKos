import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { name, username, password } = req.body;
  try {
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.rows.length > 0) return res.status(200).json({ success: false, message: 'Username sudah dipakai' });
    
    await sql`INSERT INTO users (role, username, password, name) VALUES ('resident', ${username}, ${password}, ${name})`;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}