import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Auto-create tabel expenses jika belum ada di database Neon
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          nominal INT NOT NULL,
          category VARCHAR(50) DEFAULT 'Operasional',
          expense_date DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch (migErr) {
      console.error('Migrasi tabel expenses gagal:', migErr);
    }

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM expenses ORDER BY expense_date DESC, id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { title, nominal, category, expense_date } = req.body;
      if (!title || !nominal) {
        return res.status(400).json({ success: false, message: 'Judul dan nominal wajib diisi' });
      }

      await sql`
        INSERT INTO expenses (title, nominal, category, expense_date)
        VALUES (${title}, ${parseInt(nominal, 10)}, ${category || 'Operasional'}, ${expense_date || new Date().toISOString().split('T')[0]})
      `;
      return res.status(200).json({ success: true, message: 'Pengeluaran berhasil dicatat' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM expenses WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Data pengeluaran berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method tidak diizinkan' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}