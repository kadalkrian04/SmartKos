import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT key_name, key_value FROM settings`;
      const settingsMap = {};
      rows.forEach(r => { settingsMap[r.key_name] = r.key_value; });
      return res.status(200).json(settingsMap);
    }
    
    if (req.method === 'POST') {
      const { merchant_id, secret_key } = req.body;
      await sql`UPDATE settings SET key_value = ${merchant_id} WHERE key_name = 'tokopay_merchant_id'`;
      await sql`UPDATE settings SET key_value = ${secret_key} WHERE key_name = 'tokopay_secret_key'`;
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}