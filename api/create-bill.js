// /api/create-bill.js

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
    // Hanya benarkan kaedah POST
    if (request.method !== 'POST') {
        response.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        // Ambil data yang dihantar dari cart-logic.js
        const inputData = request.body;

        // Ambil Secret Key & Category Code dari Environment Variables di Vercel (lebih selamat)
        const userSecretKey = process.env.TOYYIBPAY_SECRET_KEY;
        const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

        // Sediakan keterangan bil dari item-item troli
        const billDescription = "Pembayaran untuk: " + 
            inputData.items.map(item => `${item.quantity}x ${item.name}`).join(', ');

        // Sediakan data untuk dihantar ke ToyyibPay
        // Gunakan URLSearchParams untuk format x-www-form-urlencoded
        const toyyibpayData = new URLSearchParams({
            'userSecretKey': userSecretKey,
            'categoryCode': categoryCode,
            'billName': 'Pesanan dari Laman Web Dr Aizat',
            'billDescription': billDescription,
            'billPriceSetting': 1,
            'billPayorInfo': 1,
            'billAmount': inputData.total * 100, // Amaun mesti dalam sen
            'billReturnUrl': 'https://your-website-url.com/success', // GANTIKAN DENGAN URL SEBENAR ANDA
            'billCallbackUrl': '',
            'billExternalReferenceNo': `pesanan-${Date.now()}`,
            'billTo': inputData.customer.name,
            'billEmail': inputData.customer.email,
            'billPhone': inputData.customer.phone,
            'billPaymentChannel': '2',
        });
        
        // Hantar permintaan ke API ToyyibPay menggunakan fetch
        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            body: toyyibpayData,
        });

        const toyyibpayResult = await toyyibpayResponse.json();

        // Periksa jika ada BillCode diterima
        if (toyyibpayResult && toyyibpayResult[0] && toyyibpayResult[0].BillCode) {
            // Jika berjaya, hantar BillCode kembali ke JavaScript di pelayar web
            response.status(200).json({ success: true, billCode: toyyibpayResult[0].BillCode });
        } else {
            // Jika gagal, hantar mesej ralat
            response.status(500).json({ success: false, message: 'Gagal mencipta bil di ToyyibPay.' });
        }

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, message: 'Berlaku ralat pada pelayan.' });
    }
}