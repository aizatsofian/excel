// success-logic.js

document.addEventListener('DOMContentLoaded', () => {

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

    // Fungsi untuk mengosongkan troli
    const clearCart = () => {
        localStorage.removeItem('cart');
        console.log('Troli telah dikosongkan.');
    };

    // Fungsi untuk mengemas kini kaunter troli di menu
    const updateCartCounter = () => {
        const counterElement = document.querySelector('.cart-counter');
        if (counterElement) {
            counterElement.textContent = '0';
            counterElement.style.display = 'none';
        }
    };

    // Fungsi utama untuk memulakan halaman
    const initializePage = async () => {
        await Promise.all([
            loadComponent('header.html', 'header-container'),
            loadComponent('menu.html', 'menu-container'),
            loadComponent('footer.html', 'footer-container')
        ]);
        
        clearCart(); // Kosongkan troli selepas bayaran
        updateCartCounter(); // Kemas kini kaunter kepada 0
    };

    initializePage();
});