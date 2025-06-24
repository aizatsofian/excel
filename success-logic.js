// File: success-logic.js

document.addEventListener('DOMContentLoaded', async () => {
    const customerNameContainer = document.getElementById('customer-name');
    const downloadLinksContainer = document.getElementById('download-links');

    // Kosongkan placeholder HTML
    downloadLinksContainer.innerHTML = '<li>Memuatkan pautan muat turun...</li>';
    customerNameContainer.textContent = 'Pelanggan'; // Nama sementara

    const urlParams = new URLSearchParams(window.location.search);
    const billCode = urlParams.get('billplz[id]');

    if (!billCode) {
        downloadLinksContainer.innerHTML = '<li>Ralat: ID Bil tidak ditemui. Sila hubungi kami.</li>';
        return;
    }

    try {
        // Panggil API baru untuk dapatkan butiran pesanan
        const orderDetailsResponse = await fetch(`/api/get-order-details?billCode=${billCode}`);
        if (!orderDetailsResponse.ok) {
            throw new Error('Gagal mendapatkan butiran pesanan.');
        }
        const orderDetails = await orderDetailsResponse.json();
        const { customerName, purchasedIds } = orderDetails;

        // Paparkan nama pelanggan
        if (customerName) {
            customerNameContainer.textContent = customerName;
        }

        // Dapatkan senarai penuh produk dari fail JSON
        const productsResponse = await fetch('/api/products.json');
        if (!productsResponse.ok) {
            throw new Error('Gagal memuatkan senarai produk.');
        }
        const allProducts = await productsResponse.json();
        const productMap = allProducts.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});
        
        // Jana pautan muat turun
        downloadLinksContainer.innerHTML = ''; // Kosongkan mesej "Memuatkan..."
        
        if (purchasedIds && purchasedIds.length > 0) {
            purchasedIds.forEach(id => {
                const product = productMap[id];
                if (product && product.downloadUrl) {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = product.downloadUrl;
                    link.textContent = product.name;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    listItem.appendChild(link);
                    downloadLinksContainer.appendChild(listItem);
                }
            });
        } else {
             downloadLinksContainer.innerHTML = '<li>Tiada produk ditemui untuk pesanan ini.</li>';
        }

    } catch (error) {
        console.error('Success page error:', error);
        downloadLinksContainer.innerHTML = `<li>Gagal memuatkan pautan muat turun. Sila hubungi kami dan berikan ID bil: ${billCode}</li>`;
    }
});