import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { userId } = req.body;

  try {
    const user = await sql`SELECT is_fingerprint_active FROM users WHERE id = ${userId}`;
    if(user.rows.length === 0 || !user.rows[0].is_fingerprint_active) {
        return res.status(400).json({ success: false, message: 'Selesaikan tagihan Anda terlebih dahulu!'});
    }

    // Alih-alih membuat ID acak, kita gunakan ID User dari database
    // Ini agar ESP8266 sangat mudah mencocokkan datanya (User ID 2 = Jari ID 2)
    const hardwareFingerprintId = userId.toString();
    
    await sql`UPDATE users SET fingerprint_id = ${hardwareFingerprintId} WHERE id = ${userId}`;

    res.status(200).json({ 
        success: true, 
        fingerprint_id: hardwareFingerprintId, 
        message: 'Akses disetujui! Silakan ikuti panduan pendaftaran pada alat ESP8266 di pintu Anda.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}