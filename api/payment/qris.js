import { sql } from '@vercel/postgres';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { refId, nominal } = req.body;
  
  try {
    const dbSettings = await sql`SELECT key_name, key_value FROM settings`;
    let merchant = '', secret = '';
    dbSettings.rows.forEach(r => {
      if(r.key_name === 'tokopay_merchant_id') merchant = r.key_value;
      if(r.key_name === 'tokopay_secret_key') secret = r.key_value;
    });

    // SOLUSI ERROR: Ubah string desimal dari database (contoh: "850000.00") 
    // menjadi angka bulat (850000) karena TokoPay menolak nominal berdesimal.
    const nominalBulat = Math.round(Number(nominal));

    // Menembak API TokoPay dengan nominal bulat
    const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${refId}&nominal=${nominalBulat}&metode=QRIS`;
    const { data } = await axios.get(url);
    
    // Cek apakah TokoPay membalas dengan link gambar QRIS
    if (data && data.data && data.data.qr_link) {
       res.status(200).json({ success: true, qr_url: data.data.qr_link });
    } else {
       // Jika gagal, tampilkan pesan error dari TokoPay ke terminal/jaringan
       res.status(200).json({ success: false, message: data.error_msg || 'QR gagal diproses TokoPay' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}