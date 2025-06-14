// excel-asas.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // BAHAGIAN 1: FUNGSI SOKONGAN (Diguna semula dari fail logik lain)
    // =================================================================================

    /**
     * Mengambil item troli dari Local Storage.
     * @returns {Array} Senarai item dalam troli.
     */
    const getCartItems = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    /**
     * Menyimpan item troli ke Local Storage dan mengemas kini kaunter.
     * @param {Array} cart - Senarai item troli untuk disimpan.
     */
    const saveCartItems = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
    };
    
    /**
     * Memuatkan komponen HTML luaran ke dalam elemen tertentu.
     * @param {string} filePath - Laluan ke fail HTML komponen.
     * @param {string} elementId - ID elemen untuk memuatkan HTML.
     */
    const loadComponent = async (filePath, elementId) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Gagal memuatkan ${filePath}`);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Mengemas kini nombor pada ikon troli di menu.
     */
    const updateCartCounter = () => {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Perlu tunggu menu dimuatkan sebelum cuba mengemas kini kaunter
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = totalItems;
            counterElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    };

    /**
     * Menambah produk yang ditetapkan ke dalam troli.
     * @param {object} productData - Objek yang mengandungi butiran produk (id, name, price, image).
     */
    const addProductToCart = (productData) => {
        let cart = getCartItems();
        const existingItem = cart.find(item => item.id === productData.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1
            });
        }
        
        saveCartItems(cart);
    };

    // =================================================================================
    // BAHAGIAN 2: LOGIK KHUSUS UNTUK HALAMAN BUTIRAN PRODUK
    // =================================================================================

    /**
     * Menyediakan event listener untuk butang "Add To Cart" dan "Buy Now".
     */
    const setupEventListeners = () => {
        const container = document.querySelector('.product-detail-container');
        if (!container) {
            console.error('Bekas butiran produk tidak ditemui!');
            return;
        }

        // Dapatkan data produk dari atribut data-* pada bekas utama
        const productData = {
            id: parseInt(container.dataset.id),
            name: container.dataset.name,
            price: parseFloat(container.dataset.price),
            image: container.dataset.image
        };

        container.addEventListener('click', (event) => {
            const target = event.target;

            // Logik untuk butang "Add To Cart"
            if (target.matches('.btn-add-to-cart')) {
                addProductToCart(productData);
                alert(`"${productData.name}" telah ditambah ke troli!`);
            }

            // Logik untuk butang "Buy Now"
            if (target.matches('.btn-buy-now')) {
                addProductToCart(productData); // 1. Tambah ke troli
                window.location.href = 'cart.html'; // 2. Terus ke halaman troli
            }
        });
    };


    // =================================================================================
    // BAHAGIAN 3: MEMULAKAN SEMUA PROSES
    // =================================================================================

    /**
     * Fungsi utama untuk memulakan semua proses apabila halaman dimuatkan.
     */
    const initializePage = async () => {
        // Muatkan semua komponen luaran secara serentak
        await Promise.all([
            loadComponent('../header.html', 'header-container'),
            loadComponent('../menu.html', 'menu-container'),
            loadComponent('../footer.html', 'footer-container')
        ]);
        
        // Setelah komponen dimuatkan, barulah kita boleh memulakan fungsi lain
        updateCartCounter();
        setupEventListeners();
    };

    // Mulakan keseluruhan proses
    initializePage();
});