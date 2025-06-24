const fetch = require('node-fetch');
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log("✅ Mula proses create-bill");

  try {
    const { name, email, mobile, items } = req.body;

    console.log("📥 Data pengguna:", { name, email, mobile, items });

    if (!name || !email || !mobile || !items || items.length === 0) {
      return res.status(400).json({ error: 'Maklumat tidak lengkap.' });
    }

    // Dapatkan senarai produk
const allProducts = [
  { id: 1, name: "Excel Asas", price: 10 },
  { id: 2, name: "Excel Vlookup", price: 10 },
  { id: 3, name: "Excel Pivot Table", price: 10 },
  { id: 4, name: "Excel Analisis Data", price: 10 },
  { id: 5, name: "Excel Formula", price: 10 },
  { id: 6, name: "Excel Power Query", price: 10 },
  { id: 7, name: "Excel Finance", price: 10 },
  { id: 8, name: "Excel Power Pivot", price: 10 },
  { id: 9, name: "Excel Dashboard", price: 10 },
  { id: 10, name: "Power BI", price: 10 }
];

const productMap = allProducts.reduce((map, product) => {
  map[parseInt(product.id)] = product; // pastikan key dalam bentuk nombor
  return map;
}, {});

    // Kira jumlah
    let totalAmount = 0;
    const purchasedProductIds = [];

    items.forEach(item => {
      const product = productMap[parseInt(item.id)];
      if (product) {
        totalAmount += parseFloat(product.price) * item.quantity;
        purchasedProductIds.push(item.id);
      }
    });

    if (totalAmount === 0) {
      return res.status(400).json({ error: 'Tiada produk sah.' });
    }

    // Sediakan billData
    const billData = {
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY || 'MISSING_SECRET_KEY',
      categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE || 'MISSING_CATEGORY_CODE',
      billName: 'Pembelian Produk Excel',
      billDescription: `Pembayaran ${items.length} produk`,
      billPriceSetting: 1,
      billPayorInfo: 1,
      billAmount: Math.round(totalAmount * 100), // RM50 = 5000
      billReturnUrl: 'https://excelmudah.vercel.app/success.html',
      billCallbackUrl: '',
      billExternalReferenceNo: `order-${Date.now()}`,
      billTo: (name || 'Pelanggan').substring(0, 100),
      billEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : 'dummy@email.com',
      billPhone: mobile?.replace(/\D/g, '').substring(0, 12) || '0111111111'
    };

    // Debug ke Vercel Logs
    console.log("====== DEBUG ToyyibPay Payload ======");
    console.log("✅ userSecretKey:", process.env.TOYYIBPAY_SECRET_KEY);
    console.log("✅ categoryCode:", process.env.TOYYIBPAY_CATEGORY_CODE);
    console.log("🧾 billData:", billData);
    console.log("=====================================");

    // Hantar ke ToyyibPay
    const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(billData),
    });

    const bill = await toyyibpayResponse.json();

    console.log("📤 Respon ToyyibPay:", bill);

    if (!bill || !bill[0] || !bill[0].BillCode) {
      return res.status(400).json({ error: '❌ ToyyibPay gagal cipta bil. Sila semak maklumat.' });
    }

    const billCode = bill[0].BillCode;

    // Simpan ke Redis KV
    await kv.set(`order_${billCode}`, {
      customerName: name,
      purchasedIds: purchasedProductIds
    }, { ex: 3600 });

    console.log("✅ Tamat proses create-bill, bil berjaya:", billCode);

    res.status(200).json(bill);

  } catch (error) {
    console.error('❌ Ralat API create-bill:', error);
    res.status(500).json({ error: 'Ralat pada server.' });
  }
};
