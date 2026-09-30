import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        key_value TEXT DEFAULT ''
      )
    `;

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT key_name, key_value FROM settings`;
      const config = {};
      rows.forEach(r => {
        config[r.key_name] = r.key_value;
      });
      return res.status(200).json(config);
    }

    if (req.method === 'POST') {
      const { merchant_id, secret_key, fonnte_token } = req.body;

      if (merchant_id !== undefined) {
        await sql`
          INSERT INTO settings (key_name, key_value) 
          VALUES ('tokopay_merchant_id', ${merchant_id})
          ON CONFLICT (key_name) DO UPDATE SET key_value = ${merchant_id}
        `;
      }

      if (secret_key !== undefined) {
        await sql`
          INSERT INTO settings (key_name, key_value) 
          VALUES ('tokopay_secret_key', ${secret_key})
          ON CONFLICT (key_name) DO UPDATE SET key_value = ${secret_key}
        `;
      }

      if (fonnte_token !== undefined) {
        await sql`
          INSERT INTO settings (key_name, key_value) 
          VALUES ('fonnte_token', ${fonnte_token.trim()})
          ON CONFLICT (key_name) DO UPDATE SET key_value = ${fonnte_token.trim()}
        `;
      }

      return res.status(200).json({ success: true, message: 'Pengaturan berhasil diperbarui' });
    }

    return res.status(405).json({ message: 'Method tidak didukung' });
  } catch (error) {
    console.error('Settings API Error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}