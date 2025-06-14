// /api/create-bill.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const inputData = request.body;
        console.log("Data diterima dari pelanggan:", JSON.stringify(inputData, null, 2));

        const userSecretKey = process.env.TOYYIBPAY_SECRET_KEY;
        const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

        // Log untuk pastikan environment variables dibaca dengan betul
        console.log("Secret Key Digunakan:", userSecretKey ? "Ada" : "TIADA");
        console.log("Category Code Digunakan:", categoryCode ? "Ada" : "TIADA");

        if (!userSecretKey || !categoryCode) {
            throw new Error("Secret Key atau Category Code tidak ditetapkan di Environment Variables Vercel.");
        }

        const billDescription = "Pembayaran untuk: " + 
            inputData.items.map(item => `${item.quantity}x ${item.name}`).join(', ');

        const toyyibpayData = new URLSearchParams({
            'userSecretKey': userSecretKey,
            'categoryCode': categoryCode,
            'billName': 'Pesanan Laman Web Dr Aizat',
            'billDescription': billDescription,
            'billPriceSetting': 1,
            'billPayorInfo': 1,
            'billAmount': inputData.total * 100,
            'billReturnUrl': 'https://excel3.vercel.app/success.html', // URL Selepas Bayaran Berjaya
            'billCallbackUrl': '',
            'billExternalReferenceNo': `pesanan-${Date.now()}`,
            'billTo': inputData.customer.name,
            'billEmail': inputData.customer.email,
            'billPhone': inputData.customer.phone,
            'billPaymentChannel': '2',
        });
        
        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            body: toyyibpayData,
        });

        // Log respon mentah dari ToyyibPay
        const responseText = await toyyibpayResponse.text();
        console.log("Respon dari ToyyibPay:", responseText);
        
        const toyyibpayResult = JSON.parse(responseText);

        if (Array.isArray(toyyibpayResult) && toyyibpayResult[0] && toyyibpayResult[0].BillCode) {
            response.status(200).json({ success: true, billCode: toyyibpayResult[0].BillCode });
        } else {
            // Jika ToyyibPay pulangkan ralat, kita boleh lihat di log
            response.status(500).json({ success: false, message: 'Gagal mencipta bil di ToyyibPay.' });
        }

    } catch (error) {
        console.error("RALAT DALAM FUNGSI SERVERLESS:", error.message);
        response.status(500).json({ success: false, message: 'Berlaku ralat pada pelayan.', error: error.message });
    }
}