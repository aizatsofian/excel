// js/product-page-logic.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // BAHAGIAN 1: FUNGSI SOKONGAN
    // =================================================================================

    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    const saveCartItems = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter(); // Kemas kini kaunter setiap kali troli disimpan
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

    // FUNGSI BARU: Mengemas kini nombor pada ikon troli
    const updateCartCounter = () => {
        const cart = getCartItems();
        // Kira jumlah kuantiti semua item dalam troli
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = totalItems;
            counterElement.style.display = totalItems > 0 ? 'inline-block' : 'none'; // Tunjuk jika ada item
        }
    };

    // FUNGSI BARU (Boleh Guna Semula): Untuk menambah produk ke troli
    const addProductToCart = (productCard) => {
        const productId = parseInt(productCard.dataset.id);
        const productName = productCard.dataset.name;
        const productPrice = parseFloat(productCard.dataset.price);
        const productImage = productCard.dataset.image;

        let cart = getCartItems();
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        saveCartItems(cart); // Simpan dan kemas kini kaunter
    };


    // =================================================================================
    // BAHAGIAN 2: LOGIK INTERAKSI PRODUK
    // =================================================================================

    const setupProductListeners = () => {
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            const productCard = target.closest('.product-card');

            if (!productCard) return;

            // --- LOGIK BARU UNTUK BUTANG "ADD TO CART" ---
            if (target.matches('.btn-add-to-cart')) {
                addProductToCart(productCard); // Panggil fungsi boleh guna semula
                alert(`"${productCard.dataset.name}" telah ditambah ke troli!`);
            }

            // --- LOGIK BARU UNTUK BUTANG "BUY NOW" ---
            if (target.matches('.btn-buy-now')) {
                addProductToCart(productCard); // 1. Tambah produk ke troli
                window.location.href = '/page-cart/cart.html'; // 2. Terus pergi ke halaman troli
            }
        });
    };

    // =================================================================================
    // BAHAGIAN 3: MEMULAKAN SEMUA PROSES
    // =================================================================================

    const initializePage = async () => {
        await Promise.all([
            loadComponent('header.html', 'header-container'),
            loadComponent('menu.html', 'menu-container'),
            loadComponent('footer.html', 'footer-container'),
            loadComponent('video/produk-b1.html', 'produk-b1-container'),
            loadComponent('video/produk-b2.html', 'produk-b2-container'),
            loadComponent('video/produk-b3.html', 'produk-b3-container'),
            loadComponent('buku/buku1.html', 'buku-produk-container'),
            loadComponent('template/template1.html', 'template-produk-container') 
        ]);
        
        setupProductListeners();
        updateCartCounter(); // Panggil kaunter semasa halaman mula dimuatkan
    };

    initializePage();
});