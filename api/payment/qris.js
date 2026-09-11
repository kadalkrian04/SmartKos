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

    // Menembak API TokoPay sesuai dokumentasi/script dari user
    const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${refId}&nominal=${nominal}&metode=QRIS`;
    const { data } = await axios.get(url);
    
    if (data && data.data && data.data.qr_link) {
       res.status(200).json({ success: true, qr_url: data.data.qr_link });
    } else {
       res.status(200).json({ success: false, message: 'QR gagal diproses TokoPay' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}