import { sql } from '@vercel/postgres';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    // 1. Ambil setting API dari Database
    const dbSettings = await sql`SELECT key_name, key_value FROM settings`;
    let merchant = '', secret = '';
    dbSettings.rows.forEach(r => {
      if(r.key_name === 'tokopay_merchant_id') merchant = r.key_value;
      if(r.key_name === 'tokopay_secret_key') secret = r.key_value;
    });

    if (!merchant || !secret) {
        return res.status(200).json({ success: false, message: 'Merchant ID atau Secret Key kosong!' });
    }

    // 2. Tembak API TokoPay (Order QRIS dengan nominal percobaan Rp. 1000)
    const refId = 'TEST-API-' + Date.now();
    const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${refId}&nominal=1000&metode=QRIS`;

    const { data } = await axios.get(url);

    // 3. Evaluasi balasan dari TokoPay
    if (data && data.data && data.data.qr_link) {
      res.status(200).json({ 
          success: true, 
          message: 'Sukses! API TokoPay terhubung dan QRIS berhasil digenerate.' 
      });
    } else {
      res.status(200).json({ 
          success: false, 
          message: 'Koneksi gagal! Silakan cek kembali Merchant ID dan Secret Key Anda.' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server TokoPay Error: ' + error.message });
  }
}