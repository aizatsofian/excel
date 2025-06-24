// File: api/create-bill.js

import { kv } from '@vercel/kv';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, email, mobile, items } = req.body;

        if (!name || !email || !mobile || !items || items.length === 0) {
            return res.status(400).json({ error: 'Maklumat tidak lengkap.' });
        }

        const productListUrl = new URL('/api/products.json', `https://${req.headers.host}`);
        const productsResponse = await fetch(productListUrl.href);
        
        if (!productsResponse.ok) {
            throw new Error(`Gagal memuatkan products.json: ${productsResponse.statusText}`);
        }
        const allProducts = await productsResponse.json();
        
        const productMap = allProducts.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});

        let totalAmount = 0;
        const purchasedProductIds = [];

        items.forEach(item => {
            const product = productMap[item.id];
            if (product) {
                totalAmount += parseFloat(product.price) * item.quantity;
                purchasedProductIds.push(item.id);
            }
        });

        if (totalAmount === 0) {
            return res.status(400).json({ error: 'Tiada produk sah untuk diproses.' });
        }
        
        const billData = {
            'userSecretKey': process.env.TOYYIBPAY_SECRET_KEY,
            'categoryCode': process.env.TOYYIBPAY_CATEGORY_CODE,
            'billName': 'Pembelian Produk Excel Mudah',
            'billDescription': `Pembayaran untuk ${items.length} produk dari ${name}`,
            'billPriceSetting': 1,
            'billPayorInfo': 1,
            'billAmount': Math.round(totalAmount * 100),
            'billReturnUrl': 'https://excelmudah.vercel.app/success.html', // Pastikan URL ini betul
            'billCallbackUrl': '',
            'billExternalReferenceNo': `order-${Date.now()}`,
            'billTo': name,
            'billEmail': email,
            'billPhone': mobile,
        };

        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(billData),
        });

        const bill = await toyyibpayResponse.json();

        if (!bill || !bill[0] || !bill[0].BillCode) {
            throw new Error('Gagal mencipta bil ToyyibPay.');
        }

        const billCode = bill[0].BillCode;

        await kv.set(`order_${billCode}`, {
            customerName: name,
            purchasedIds: purchasedProductIds
        }, { ex: 3600 });

        res.status(200).json(bill);

    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ error: 'Ralat pada server.' });
    }
}