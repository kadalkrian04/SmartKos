import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const action =
    req.query.action ||
    (req.url.includes('update-profile')
      ? 'update-profile'
      : req.url.includes('login')
      ? 'login'
      : 'register');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method tidak diizinkan' });
  }

  // Pastikan kolom baru (address, email, phone, nik, no_kk, dan foto dokumen) tersedia di database
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS nik VARCHAR(20) DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS no_kk VARCHAR(20) DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_selfie TEXT DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_ktp TEXT DEFAULT ''`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_kk TEXT DEFAULT ''`;
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

  // LOGIKA UPDATE PROFIL PENGHUNI (DENGAN NIK, KK & PROTEKSI FOTO PERMANEN)
  if (action === 'update-profile') {
    const {
      userId,
      name,
      nik,
      no_kk,
      address,
      email,
      phone,
      password,
      photo_selfie,
      photo_ktp,
      photo_kk
    } = req.body;

    try {
      const newSelfie = photo_selfie && photo_selfie.trim() !== '' ? photo_selfie : null;
      const newKtp = photo_ktp && photo_ktp.trim() !== '' ? photo_ktp : null;
      const newKk = photo_kk && photo_kk.trim() !== '' ? photo_kk : null;

      if (password && password.trim() !== '') {
        await sql`
          UPDATE users 
          SET 
            name = ${name},
            nik = ${nik || ''},
            no_kk = ${no_kk || ''},
            address = ${address || ''},
            email = ${email || ''},
            phone = ${phone || ''},
            password = ${password},
            photo_selfie = CASE WHEN photo_selfie IS NOT NULL AND photo_selfie <> '' THEN photo_selfie ELSE COALESCE(${newSelfie}, photo_selfie) END,
            photo_ktp = CASE WHEN photo_ktp IS NOT NULL AND photo_ktp <> '' THEN photo_ktp ELSE COALESCE(${newKtp}, photo_ktp) END,
            photo_kk = CASE WHEN photo_kk IS NOT NULL AND photo_kk <> '' THEN photo_kk ELSE COALESCE(${newKk}, photo_kk) END
          WHERE id = ${userId}
        `;
      } else {
        await sql`
          UPDATE users 
          SET 
            name = ${name},
            nik = ${nik || ''},
            no_kk = ${no_kk || ''},
            address = ${address || ''},
            email = ${email || ''},
            phone = ${phone || ''},
            photo_selfie = CASE WHEN photo_selfie IS NOT NULL AND photo_selfie <> '' THEN photo_selfie ELSE COALESCE(${newSelfie}, photo_selfie) END,
            photo_ktp = CASE WHEN photo_ktp IS NOT NULL AND photo_ktp <> '' THEN photo_ktp ELSE COALESCE(${newKtp}, photo_ktp) END,
            photo_kk = CASE WHEN photo_kk IS NOT NULL AND photo_kk <> '' THEN photo_kk ELSE COALESCE(${newKk}, photo_kk) END
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