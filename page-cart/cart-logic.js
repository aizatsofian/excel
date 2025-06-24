// Kod Penuh dan Betul untuk cart-logic.js

document.addEventListener('DOMContentLoaded', () => {

    // ▼▼▼ PASTIKAN URL WEB APP ANDA BETUL DI SINI ▼▼▼
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxq0rAI-00QXL_NREuZLlOslAx7o3zknIbNiTQ-fMXIz3faNQXa4_v451SrS6zO9oAIWA/exec';
    // ▲▲▲ PASTIKAN URL WEB APP ANDA BETUL DI SINI ▲▲▲

    const cartTableBody = document.getElementById('cart-items-body');
    const cartTotalPriceEl = document.getElementById('cart-total-price');

    // =================================================================================
    // BAHAGIAN 1: FUNGSI-FUNGSI ASAS
    // =================================================================================

    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    const saveCartItems = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
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

    const updateCartCounter = () => {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = totalItems;
            counterElement.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }
    };

    const renderCart = () => {
        const cart = getCartItems();
        cartTableBody.innerHTML = '';
        if (cart.length === 0) {
            cartTableBody.innerHTML = `<tr class="cart-empty-row"><td colspan="6">Your cart is currently empty.</td></tr>`;
        } else {
            cart.forEach((item, index) => {
                const itemTotalPrice = item.price * item.quantity;
                const row = `<tr><td>${index + 1}</td><td><div class="cart-item-info"><img src="${item.image || 'img/default-product.png'}" alt="${item.name}" class="cart-item-image"><span class="cart-item-title">${item.name}</span></div></td><td>RM ${item.price.toFixed(2)}</td><td><div class="quantity-controls"><button class="quantity-btn decrease-btn" data-id="${item.id}">-</button><input type="text" class="quantity-input" value="${item.quantity}" readonly><button class="quantity-btn increase-btn" data-id="${item.id}">+</button></div></td><td>RM ${itemTotalPrice.toFixed(2)}</td><td class="action-delete"><a href="#" class="delete-btn" data-id="${item.id}">Delete</a></td></tr>`;
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
    // BAHAGIAN 2: EVENT LISTENERS
    // =================================================================================

    cartTableBody.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('.increase-btn, .decrease-btn, .delete-btn')) return;

        let cart = getCartItems();
        const productID = parseInt(target.dataset.id);

        if (target.matches('.increase-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item) item.quantity++;
        } else if (target.matches('.decrease-btn')) {
            const item = cart.find(i => i.id === productID);
            if (item && item.quantity > 1) item.quantity--;
        } else if (target.matches('.delete-btn')) {
            event.preventDefault();
            const itemName = target.closest('tr').querySelector('.cart-item-title').textContent;
            if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
                cart = cart.filter(item => item.id !== productID);
            }
        }
        saveCartItems(cart);
        renderCart();
    });

    const deliveryForm = document.getElementById('delivery-form');
    deliveryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const checkoutButton = document.querySelector('.btn-checkout');
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Memproses...';

        const customerData = { name: document.getElementById('full-name').value, phone: document.getElementById('phone-number').value, email: document.getElementById('email').value, address: document.getElementById('full-address').value };
        if (!customerData.name || !customerData.phone || !customerData.email || !customerData.address) {
            alert('Sila lengkapkan semua butiran penghantaran.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
            return;
        }

        const cart = getCartItems();
        if (cart.length === 0) {
            alert('Troli anda kosong. Sila tambah produk terlebih dahulu.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
            return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const payload = {
  name: customerData.name,
  email: customerData.email,
  mobile: customerData.phone,
  address: customerData.address,
  items: cart,
  total: totalAmount
};
        
        try {
            console.log("Menghantar data ke Google Sheet...");
            const sheetPromise = fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Perubahan di sini
                body: JSON.stringify(payload)
            });

            console.log("Menghantar data ke ToyyibPay...");
            const toyyibpayPromise = fetch('/api/create-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            // Tunggu kedua-dua proses selesai
            const [sheetResult, toyyibpayResponse] = await Promise.all([sheetPromise, toyyibpayPromise]);

            console.log("Proses Google Sheet selesai.");
            
            const toyyibpayResult = await toyyibpayResponse.json();

            if (toyyibpayResult.success && toyyibpayResult.billCode) {
                window.location.href = `https://toyyibpay.com/${toyyibpayResult.billCode}`;
            } else {
                alert('Ralat ToyyibPay: ' + (toyyibpayResult.message || 'Gagal mencipta bil pembayaran.'));
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Check Out';
            }
        } catch (error) {
            console.error('Ralat semasa proses checkout:', error);
            alert('Berlaku masalah teknikal. Sila cuba lagi.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
        }
    });

    // =================================================================================
    // BAHAGIAN 3: MEMULAKAN HALAMAN
    // =================================================================================

    const initializePage = async () => {
        await Promise.all([
            loadComponent('../header.html', 'header-container'),
            loadComponent('../menu.html', 'menu-container'),
            loadComponent('../footer.html', 'footer-container')
        ]);
        renderCart();
        updateCartCounter();
    };

    initializePage();
});