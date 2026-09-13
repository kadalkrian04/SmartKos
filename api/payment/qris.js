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

    // SOLUSI ERROR: Ubah string desimal dari database menjadi angka bulat
    const nominalBulat = Math.round(Number(nominal));

    // Cek Minimal Nominal TokoPay
    if (nominalBulat < 1000) {
        return res.status(200).json({ success: false, message: 'Minimal pembayaran QRIS TokoPay adalah Rp 1.000' });
    }

    // BIKIN REF_ID BARU: TokoPay menolak "Ref ID" yang sama jika user klik tombol berulang kali
    const parts = refId.split('-');
    let freshRefId = refId;
    if(parts.length >= 2) {
       freshRefId = `${parts[0]}-${parts[1]}-${Date.now()}`;
       await sql`UPDATE bills SET ref_id = ${freshRefId} WHERE ref_id = ${refId}`;
    }

    // Menembak API TokoPay dengan nominal bulat dan Ref ID Baru
    const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${freshRefId}&nominal=${nominalBulat}&metode=QRIS`;
    const { data } = await axios.get(url);

    // Cek apakah TokoPay membalas dengan link gambar QRIS
    if (data && data.data && data.data.qr_link) {
       res.status(200).json({ success: true, qr_url: data.data.qr_link, new_ref_id: freshRefId });
    } else {
       // Jika gagal, tampilkan pesan error ASLI dari TokoPay ke UI
       res.status(200).json({ success: false, message: data.error_msg || 'QR gagal diproses TokoPay' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}