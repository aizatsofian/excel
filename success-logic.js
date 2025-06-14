// success-logic.js

document.addEventListener('DOMContentLoaded', () => {

    // "Pangkalan Data" ringkas untuk pautan muat turun anda.
    // ID produk mesti sama dengan data-id yang anda tetapkan sebelum ini.
    const productLinks = {
        1: 'https://www.youtube.com/watch?v=6j6kdpStCrI',  // Excel Asas
        2: 'https://www.youtube.com/watch?v=NTjTcCOkN34',  // Excel Vlookup
        3: 'https://www.youtube.com/watch?v=FBkei_ymuts',  // Excel Pivot Table
        // ... tambah ID dan pautan untuk 10 produk lain di sini jika ada
    };

    const loadComponent = async (filePath, elementId) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(error);
        }
    };

    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    // Fungsi BARU untuk memaparkan butiran pembelian
    const displayPurchaseDetails = () => {
        const purchasedItems = getCartItems();
        const container = document.getElementById('download-links-container');

        if (purchasedItems.length === 0) {
            container.innerHTML = '<p>Tiada maklumat pembelian ditemui.</p>';
            return;
        }

        purchasedItems.forEach(item => {
            const link = productLinks[item.id]; // Cari pautan berdasarkan ID produk
            
            if (link) {
                const linkElement = document.createElement('a');
                linkElement.href = link;
                linkElement.textContent = `Muat Turun: ${item.name}`;
                linkElement.className = 'download-link';
                linkElement.target = '_blank'; // Buka dalam tab baru
                linkElement.rel = 'noopener noreferrer';
                container.appendChild(linkElement);
            }
        });
    };
    
    const clearCart = () => {
        localStorage.removeItem('cart');
        console.log('Troli telah dikosongkan.');
    };

    const updateCartCounter = () => {
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = '0';
            counterElement.style.display = 'none';
        }
    };

    const initializePage = async () => {
        await Promise.all([
            loadComponent('header.html', 'header-container'),
            loadComponent('menu.html', 'menu-container'),
            loadComponent('footer.html', 'footer-container')
        ]);
        
        displayPurchaseDetails(); // 1. Paparkan pautan muat turun dahulu
        clearCart();              // 2. Kemudian, baru kosongkan troli
        updateCartCounter();      // 3. Kemas kini kaunter kepada 0
    };

    initializePage();
});