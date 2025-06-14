// js/cart-logic.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // BAHAGIAN 1: FUNGSI SOKONGAN UNTUK TROLIDAN KOMPONEN
    // =================================================================================

    // Fungsi untuk mendapatkan item troli dari localStorage
    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : []; // Jika troli tiada, pulangkan array kosong
    };

    // Fungsi untuk menyimpan item troli ke localStorage dan kemas kini kaunter
    const saveCartItems = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter(); // Kemas kini kaunter setiap kali troli disimpan
    };
    
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
    
    // Fungsi untuk mengemas kini nombor pada ikon troli
    const updateCartCounter = () => {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = totalItems;
            counterElement.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }
    };


    // =================================================================================
    // BAHAGIAN 2: MEMAPARKAN KANDUNGAN TROLIS (RENDER)
    // =================================================================================

    const cartTableBody = document.getElementById('cart-items-body');
    const cartTotalPriceEl = document.getElementById('cart-total-price');

    const renderCart = () => {
        const cart = getCartItems();
        cartTableBody.innerHTML = ''; 

        if (cart.length === 0) {
            cartTableBody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="6">Your cart is currently empty.</td>
                </tr>
            `;
        } else {
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

    const updateCartTotal = () => {
        const cart = getCartItems();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = `RM ${total.toFixed(2)}`;
    };

    // =================================================================================
    // BAHAGIAN 3: PENGURUSAN INTERAKSI (EVENT LISTENERS)
    // =================================================================================
    
    // Urus klik untuk kuantiti dan padam
    cartTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const productID = parseInt(target.getAttribute('data-id'));
        let cart = getCartItems();

        if (target.classList.contains('increase-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item) item.quantity++;
        }

        if (target.classList.contains('decrease-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item && item.quantity > 1) item.quantity--;
        }

        if (target.classList.contains('delete-btn')) {
            event.preventDefault();
            const itemName = target.closest('tr').querySelector('.cart-item-title').textContent;
            if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
                 cart = cart.filter(item => item.id !== productID);
            }
        }
        
        saveCartItems(cart);
        renderCart();
    });

    // Urus penghantaran borang "Check Out"
    const deliveryForm = document.getElementById('delivery-form');
    deliveryForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const checkoutButton = document.querySelector('.btn-checkout');
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Memproses...';

        const customerData = {
            name: document.getElementById('full-name').value,
            phone: document.getElementById('phone-number').value,
            email: document.getElementById('email').value,
            address: document.getElementById('full-address').value
        };
        
        if (!customerData.name || !customerData.phone || !customerData.email || !customerData.address) {
            alert('Sila lengkapkan semua butiran penghantaran.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
            return;
        }

        const cart = getCartItems();
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cart.length === 0) {
            alert('Troli anda kosong. Sila tambah produk terlebih dahulu.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
            return;
        }

        try {
            // Hantar semua data ke Vercel Serverless Function
            const response = await fetch('/api/create-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: customerData,
                    items: cart,
                    total: totalAmount
                })
            });

            const result = await response.json();

            if (result.success && result.billCode) {
                // Jika berjaya, halakan pengguna ke halaman pembayaran ToyyibPay
                window.location.href = `https://toyyibpay.com/${result.billCode}`;
            } else {
                alert('Ralat: ' + (result.message || 'Gagal mencipta bil pembayaran.'));
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Check Out';
            }
        } catch (error) {
            console.error('Ralat semasa menghubungi server:', error);
            alert('Berlaku masalah teknikal. Sila cuba lagi.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
        }
    });

    // =================================================================================
    // BAHAGIAN 4: MEMULAKAN HALAMAN
    // =================================================================================

    const initializePage = async () => {
        await Promise.all([
            loadComponent('header.html', 'header-container'),
            loadComponent('menu.html', 'menu-container'),
            loadComponent('footer.html', 'footer-container')
        ]);
        
        renderCart(); // Paparkan item troli
        updateCartCounter(); // Kemas kini kaunter pada permulaan
    };

    initializePage();
});