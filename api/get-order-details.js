// File: api/get-order-details.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { billCode } = req.query;

    if (!billCode) {
        return res.status(400).json({ error: 'Bill code diperlukan.' });
    }

    try {
        // Dapatkan butiran pesanan dari Vercel KV menggunakan billCode
        const orderDetails = await kv.get(`order_${billCode}`);

        if (!orderDetails) {
            return res.status(404).json({ error: 'Butiran pesanan tidak ditemui.' });
        }

        // Hantar butiran pesanan kembali ke client-side
        res.status(200).json(orderDetails);
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Ralat pada server.' });
    }
}