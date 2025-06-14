// js/cart-logic.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // BAHAGIAN 1: DATA DAN FUNGSI SOKONGAN
    // =================================================================================

    /**
     * ! PENTING UNTUK TUJUAN PENGUJIAN (TESTING) !
     * Untuk melihat halaman troli berfungsi tanpa perlu menambah item dari halaman utama,
     * anda boleh buang komen (uncomment) pada blok kod di bawah buat sementara waktu.
     * Ia akan mencipta data troli palsu (dummy data).
     * Jangan lupa komen semula selepas selesai menguji.
     */
    /*
    const dummyCartData = [
        { id: 10, name: 'Excel HRMIS', price: 2.00, image: 'img/produk-hrmis.png', quantity: 1 },
        { id: 3, name: 'Excel Pivot Table', price: 2.00, image: 'img/produk-pivot-table.png', quantity: 2 }
    ];
    localStorage.setItem('cart', JSON.stringify(dummyCartData));
    */
    

    // Fungsi untuk mendapatkan item troli dari localStorage
    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : []; // Jika troli tiada, pulangkan array kosong
    };

    // Fungsi untuk menyimpan item troli ke localStorage
    const saveCartItems = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // =================================================================================
    // BAHAGIAN 2: MEMAPARKAN KANDUNGAN (RENDER)
    // =================================================================================

    const cartTableBody = document.getElementById('cart-items-body');
    const cartTotalPriceEl = document.getElementById('cart-total-price');

    // Fungsi utama untuk memaparkan semua item troli di dalam jadual
    const renderCart = () => {
        const cart = getCartItems();
        cartTableBody.innerHTML = ''; // Kosongkan jadual sebelum memaparkan data baru

        if (cart.length === 0) {
            // Jika troli kosong, paparkan mesej
            cartTableBody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="6">Your cart is currently empty.</td>
                </tr>
            `;
        } else {
            // Jika ada item, jana baris jadual untuk setiap item
            cart.forEach((item, index) => {
                const itemTotalPrice = item.price * item.quantity;
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <div class="cart-item-info">
                                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                                <span class="cart-item-title">${item.name}</span>
                            </div>
                        </td>
                        <td>RM ${item.price.toFixed(2)}</td>
                        <td>
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                                <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                            </div>
                        </td>
                        <td>RM ${itemTotalPrice.toFixed(2)}</td>
                        <td class="action-delete">
                            <a href="#" class="delete-btn" data-id="${item.id}">Delete</a>
                        </td>
                    </tr>
                `;
                cartTableBody.innerHTML += row;
            });
        }
        updateCartTotal();
    };

    // Fungsi untuk mengira dan mengemas kini jumlah harga keseluruhan
    const updateCartTotal = () => {
        const cart = getCartItems();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = `RM ${total.toFixed(2)}`;
    };

    // =================================================================================
    // BAHAGIAN 3: PENGURUSAN INTERAKSI (EVENT LISTENERS)
    // =================================================================================
    
    // Menggunakan 'Event Delegation' untuk mengurus semua klik di dalam jadual
    cartTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const productID = parseInt(target.getAttribute('data-id'));
        let cart = getCartItems();

        // Logik untuk butang TAMBAH kuantiti (+)
        if (target.classList.contains('increase-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item) {
                item.quantity++;
            }
        }

        // Logik untuk butang KURANG kuantiti (-)
        if (target.classList.contains('decrease-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item && item.quantity > 1) {
                item.quantity--;
            }
        }

        // Logik untuk butang DELETE
        if (target.classList.contains('delete-btn')) {
            event.preventDefault(); // Elak pautan dari melompat ke atas halaman
            if (confirm(`Are you sure you want to remove "${target.closest('tr').querySelector('.cart-item-title').textContent}"?`)) {
                 cart = cart.filter(item => item.id !== productID);
            }
        }
        
        // Simpan perubahan dan paparkan semula troli
        saveCartItems(cart);
        renderCart();
    });

    // =================================================================================
    // BAHAGIAN 4: MEMUATKAN KOMPONEN & MEMULAKAN SKRIP
    // =================================================================================

    // Fungsi untuk memuatkan komponen luaran seperti header dan footer
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
    
    // Fungsi utama untuk memulakan semua proses
    const initializePage = async () => {
        await Promise.all([
            loadComponent('header.html', 'header-container'),
            loadComponent('menu.html', 'menu-container'),
            loadComponent('footer.html', 'footer-container')
        ]);
        
        // Selepas komponen dimuatkan, paparkan item dalam troli
        renderCart();
    };

    // Mulakan semuanya!
    initializePage();
});