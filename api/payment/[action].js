import { sql } from '@vercel/postgres';
import axios from 'axios';

export default async function handler(req, res) {
  const action = req.query.action || (
    req.url.includes('callback') ? 'callback' : 
    req.url.includes('qris') ? 'qris' : 'test'
  );

  // 1. CALLBACK / WEBHOOK DARI TOKOPAY
  if (action === 'callback') {
    try {
      let payload = req.method === 'POST' ? req.body : req.query;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch(e) {}
      }
      const payloadString = JSON.stringify(payload || {});

      // Catat webhook ke logs untuk audit sistem
      try {
        await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK MASUK: ' + payloadString.substring(0, 220)})`;
      } catch(e) {}

      // Otomatis pastikan kolom payment_method tersedia di tabel bills
      try {
        await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'QRIS'`;
      } catch (colErr) {}

      // Cari Ref ID baru (ADIBKOS-...) atau fallback lama (INV-...)
      let ref_id = payload.ref_id || payload.reff_id || payload.order_id || null;
      if (!ref_id) {
        const match = payloadString.match(/(?:ADIBKOS|INV)-\d+-\d+/i);
        ref_id = match ? match[0] : null;
      }

      // Deteksi channel / metode pembayaran yang dipakai pembeli (misal: GoPay, ShopeePay, DANA, OVO)
      let rawMethod = payload.channel || payload.metode || payload.payment_method || payload.brand || payload.pay_name || payload.issuer || payload.source || (payload.data && (payload.data.channel || payload.data.metode || payload.data.payment_method)) || '';
      const methodUpper = (rawMethod + ' ' + payloadString).toUpperCase();

      let detectedMethod = 'QRIS';
      if (methodUpper.includes('DANA')) {
        detectedMethod = 'QRIS DANA';
      } else if (methodUpper.includes('GOPAY')) {
        detectedMethod = 'QRIS GoPay';
      } else if (methodUpper.includes('BCA')) {
        detectedMethod = 'QRIS BCA';
      } else if (methodUpper.includes('SHOPEE') || methodUpper.includes('SPAY')) {
        detectedMethod = 'QRIS ShopeePay';
      } else if (methodUpper.includes('OVO')) {
        detectedMethod = 'QRIS OVO';
      } else if (methodUpper.includes('LIVIN') || methodUpper.includes('MANDIRI')) {
        detectedMethod = 'QRIS Mandiri';
      } else if (methodUpper.includes('BRIMO') || methodUpper.includes('BRI')) {
        detectedMethod = 'QRIS BRI';
      } else if (methodUpper.includes('BNI')) {
        detectedMethod = 'QRIS BNI';
      } else if (rawMethod && rawMethod.toString().trim() !== '') {
        const clean = rawMethod.toString().trim();
        detectedMethod = clean.toUpperCase().startsWith('QRIS') ? clean : `QRIS ${clean}`;
      }

      const pLower = payloadString.toLowerCase();
      const isSuccess = pLower.includes('success') || pLower.includes('sukses') || pLower.includes('paid') || pLower.includes('settlement') || payload.status === '1' || payload.status === 1 || payload.status === 'dibayar';

      if (ref_id && isSuccess) {
        const updateBill = await sql`
          UPDATE bills 
          SET status = 'lunas', payment_method = ${detectedMethod} 
          WHERE ref_id = ${ref_id} 
          RETURNING user_id
        `;
        if (updateBill.rows.length > 0) {
          const userId = updateBill.rows[0].user_id;
          await sql`
            UPDATE users 
            SET is_fingerprint_active = true, 
                active_until = CURRENT_DATE + INTERVAL '37 days' 
            WHERE id = ${userId}
          `;
          await sql`INSERT INTO logs (user_id, action) VALUES (${userId}, ${'Pembayaran Lunas via ' + detectedMethod + ': ' + ref_id})`;
        }
      }
      return res.status(200).json({ success: true, message: 'Laporan Diterima' });
    } catch(e) {
      try { await sql`INSERT INTO logs (user_id, action) VALUES (0, ${'WEBHOOK ERROR: ' + e.message})`; } catch(err){}
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // 2. GENERATE QRIS TOKOPAY DENGAN FORMAT ADIBKOS
  if (action === 'qris') {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { refId, nominal } = req.body;
    try {
      const dbSettings = await sql`SELECT key_name, key_value FROM settings`;
      let merchant = '', secret = '';
      dbSettings.rows.forEach(r => {
        if(r.key_name === 'tokopay_merchant_id') merchant = r.key_value;
        if(r.key_name === 'tokopay_secret_key') secret = r.key_value;
      });

      const nominalBulat = Math.round(Number(nominal));
      if (nominalBulat < 1000) {
        return res.status(200).json({ success: false, message: 'Minimal pembayaran QRIS TokoPay adalah Rp 1.000' });
      }

      // Generate Ref ID berformat ADIBKOS-[USER_ID]-[UNIX_TIMESTAMP]
      const parts = (refId || '').split('-');
      const userId = parts.length >= 2 ? parts[1] : '1';
      const freshRefId = `ADIBKOS-${userId}-${Math.floor(Date.now() / 1000)}`;

      await sql`UPDATE bills SET ref_id = ${freshRefId} WHERE ref_id = ${refId}`;

      const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${freshRefId}&nominal=${nominalBulat}&metode=QRIS`;
      const { data } = await axios.get(url);

      if (data && data.data && data.data.qr_link) {
        return res.status(200).json({ success: true, qr_url: data.data.qr_link, new_ref_id: freshRefId });
      } else {
        return res.status(200).json({ success: false, message: data.error_msg || 'QR gagal diproses TokoPay' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. TES KONEKSI TOKOPAY
  if (action === 'test') {
    try {
      const dbSettings = await sql`SELECT key_name, key_value FROM settings`;
      let merchant = '', secret = '';
      dbSettings.rows.forEach(r => {
        if(r.key_name === 'tokopay_merchant_id') merchant = r.key_value;
        if(r.key_name === 'tokopay_secret_key') secret = r.key_value;
      });

      if (!merchant || !secret) {
        return res.status(200).json({ success: false, message: 'Merchant ID atau Secret Key kosong!' });
      }

      const refId = 'ADIBKOS-TEST-' + Math.floor(Date.now() / 1000);
      const url = `https://api.tokopay.id/v1/order?merchant=${merchant}&secret=${secret}&ref_id=${refId}&nominal=1000&metode=QRIS`;
      const { data } = await axios.get(url);

      if (data && data.data && data.data.qr_link) {
        return res.status(200).json({ success: true, message: 'Sukses! API TokoPay terhubung dan QRIS berhasil digenerate.' });
      } else {
        return res.status(200).json({ success: false, message: 'Koneksi gagal! Silakan cek kembali Merchant ID dan Secret Key Anda.' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server TokoPay Error: ' + error.message });
    }
  }

  return res.status(404).json({ message: 'Aksi payment tidak ditemukan' });
}