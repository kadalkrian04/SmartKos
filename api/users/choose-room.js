import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { userId, roomId } = req.body;

  try {
    const roomData = await sql`SELECT price, number FROM rooms WHERE id = ${roomId} AND status = 'available'`;
    if (roomData.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Maaf, kamar ini sudah tidak tersedia.' });
    }
    const roomPrice = roomData.rows[0].price;

    // Masukkan ID kamar ke user tersebut
    await sql`UPDATE users SET room_id = ${roomId} WHERE id = ${userId}`;

    // Ubah status kamar menjadi terisi (occupied)
    await sql`UPDATE rooms SET status = 'occupied', resident_id = ${userId} WHERE id = ${roomId}`;

    // Agar user bisa langsung scan QRIS di dashboard
    const refId = `INV-${userId}-${Date.now()}`;
    await sql`
      INSERT INTO bills (user_id, nominal, month, due_date, ref_id)
      VALUES (${userId}, ${roomPrice}, TO_CHAR(CURRENT_DATE, 'Month YYYY'), CURRENT_DATE + INTERVAL '1 days', ${refId})
    `;

    res.status(200).json({ success: true, message: 'Berhasil memilih kamar dan tagihan telah dibuat' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}