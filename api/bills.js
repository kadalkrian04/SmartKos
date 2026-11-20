import { sql } from '@vercel/postgres';

// Helper: hitung tanggal jatuh tempo berdasarkan tanggal patokan (daftar / bayar pertama)
function calculateDueDate(anchorDateRaw) {
  const anchor = anchorDateRaw ? new Date(anchorDateRaw) : new Date();
  const anchorDay = isNaN(anchor.getTime()) ? new Date().getDate() : anchor.getDate();

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // Jika hari ini sudah melewati tanggal patokan bulan ini, arahkan ke bulan berikutnya
  if (now.getDate() > anchorDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  // Aman untuk tanggal 29, 30, 31 di bulan yang harinya lebih sedikit (misal Februari)
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const finalDay = Math.min(anchorDay, lastDayOfMonth);

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(finalDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Helper: tambah 1 bulan dari tanggal tertentu (untuk active_until saat lunas)
function addOneMonth(dateRaw) {
  const base = dateRaw ? new Date(dateRaw) : new Date();
  const validBase = isNaN(base.getTime()) ? new Date() : base;
  const origDay = validBase.getDate();

  let year = validBase.getFullYear();
  let month = validBase.getMonth() + 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const finalDay = Math.min(origDay, lastDayOfMonth);

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(finalDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default async function handler(req, res) {
  try {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS bills (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          nominal INT NOT NULL,
          month VARCHAR(50) NOT NULL,
          due_date DATE NOT NULL,
          ref_id VARCHAR(100) NOT NULL UNIQUE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(50) DEFAULT 'QRIS',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'QRIS'`;
    } catch (migErr) {
      console.error('Migrasi tabel bills:', migErr);
    }

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, user_id, nominal, month, due_date, ref_id, status, payment_method, created_at 
        FROM bills 
        ORDER BY id DESC
      `;
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    }

    if (req.method === 'POST') {
      // Ambil seluruh penyewa aktif beserta tanggal daftar (created_at) & tanggal bayar pertama
      const residents = await sql`
        SELECT 
          u.id, 
          u.name, 
          u.room_id, 
          u.created_at AS user_created_at,
          r.number, 
          r.price,
          (
            SELECT MIN(b.created_at) 
            FROM bills b 
            WHERE b.user_id = u.id AND b.status = 'lunas'
          ) AS first_paid_at
        FROM users u 
        INNER JOIN rooms r ON (u.room_id = r.id OR u.room_id::text = r.number::text)
        WHERE u.role = 'resident'
      `;

      for (const resident of residents.rows) {
        const refId = `ADIBKOS-${resident.id}-${Math.floor(Date.now() / 1000)}`;
        const price = resident.price || 500000;

        // Patokan jatuh tempo: tanggal bayar pertama, atau tanggal daftar akun jika belum pernah bayar
        const anchorDate = resident.first_paid_at || resident.user_created_at || new Date();
        const dueDateStr = calculateDueDate(anchorDate);
        const anchorDayNum = new Date(anchorDate).getDate();

        await sql`
          INSERT INTO bills (user_id, nominal, month, due_date, ref_id, payment_method, status)
          VALUES (
            ${resident.id},
            ${price},
            TO_CHAR(CURRENT_DATE, 'Month YYYY'),
            ${dueDateStr}::DATE,
            ${refId},
            'QRIS',
            'pending'
          )
        `;

        await sql`
          INSERT INTO logs (user_id, action) 
          VALUES (${resident.id}, ${'Tagihan baru dibuat untuk Kamar ' + resident.number + ' (Jatuh tempo tgl ' + anchorDayNum + ')'})
        `;
      }

      return res.status(200).json({ success: true, message: 'Tagihan bulan ini berhasil dibuat sesuai tanggal masing-masing penghuni' });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { action, nominal, user_id, payment_method } = req.body;

      // 1. Aksi Set Lunas Manual oleh Admin
      if (action === 'set_lunas') {
        const method = payment_method || 'Tunai / Manual';

        // Ambil data tagihan untuk mengetahui due_date-nya
        const billRes = await sql`SELECT due_date FROM bills WHERE id = ${id}`;
        const billDueDate = billRes.rows[0]?.due_date;

        await sql`
          UPDATE bills 
          SET status = 'lunas', payment_method = ${method} 
          WHERE id = ${id}
        `;

        if (user_id) {
          // Perpanjang masa aktif 1 bulan dari tanggal jatuh tempo tagihan (atau dari hari ini jika pembayaran pertama)
          const activeUntilStr = addOneMonth(billDueDate || new Date());

          await sql`
            UPDATE users 
            SET is_fingerprint_active = true,
                active_until = ${activeUntilStr}::DATE
            WHERE id = ${user_id}
          `;
          await sql`INSERT INTO logs (user_id, action) VALUES (${user_id}, ${'Tagihan dilunasi manual (' + method + '), aktif s/d ' + activeUntilStr})`;
        }

        return res.status(200).json({ success: true, message: 'Tagihan berhasil ditandai Lunas' });
      }

      // 2. Aksi Koreksi Metode Pembayaran
      if (payment_method && !nominal) {
        await sql`UPDATE bills SET payment_method = ${payment_method} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Metode pembayaran diperbarui' });
      }

      // 3. Aksi Edit Nominal Tagihan
      if (nominal) {
        await sql`UPDATE bills SET nominal = ${parseInt(nominal, 10)} WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Nominal tagihan diperbarui' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM bills WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Tagihan berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    console.error('API Bills Error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}