import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { userId } = req.body;

  try {
    // Pastikan user statusnya lunas dan aktif sebelum mendaftar sidik jari
    const user = await sql`SELECT is_fingerprint_active FROM users WHERE id = ${userId}`;
    if(user.rows.length === 0 || !user.rows[0].is_fingerprint_active) {
        return res.status(400).json({ success: false, message: 'Selesaikan tagihan Anda terlebih dahulu!'});
    }

    // Karena tidak ada mesin hardware asli yg nempel web, kita generate Dummy Fingerprint ID
    const mockFingerprintId = 'FP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Simpan ke database
    await sql`UPDATE users SET fingerprint_id = ${mockFingerprintId} WHERE id = ${userId}`;

    res.status(200).json({ 
        success: true, 
        fingerprint_id: mockFingerprintId, 
        message: 'Sidik jari berhasil direkam dan didaftarkan pada pintu!' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}