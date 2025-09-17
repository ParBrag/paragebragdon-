// Initialize Stripe
const stripe = Stripe('your_stripe_publishable_key');

// Cart functionality
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count-number');
const checkoutBtn = document.getElementById('checkout-btn');
const productModal = document.getElementById('product-modal');
const closeModal = document.getElementById('close-modal');
const modalContent = document.getElementById('modal-content');
const filterBtns = document.querySelectorAll('.filter-btn');
const productFilters = document.querySelectorAll('.product-filter');
const contactForm = document.getElementById('contact-form');
const darkModeToggle = document.getElementById('darkModeToggle');
const productSearch = document.getElementById('product-search');

// Initialize the page
function init() {
    renderProducts();
    setupEventListeners();
    updateCartCount();
    checkDarkModePreference();
    loadCart();
}

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Failed to load cart.', 'error');
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
        showNotification('Failed to save cart.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.style.padding = '10px 20px';
    notif.style.backgroundColor = type === 'error' ? 'var(--notification-error)' : 'var(--notification-success)';
    notif.style.color = '#fff';
    notif.style.marginBottom = '10px';
    notif.style.borderRadius = '5px';
    notif.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notif.textContent = message;
    container.appendChild(notif);
    setTimeout(() => {
        if (container.contains(notif)) {
            container.removeChild(notif);
        }
    }, 3000);
}

// Check dark mode preference
function checkDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Light Mode';
    }
}

// Trap focus for accessibility
function trapFocus(element, isOpen) {
    if (!isOpen) return;
    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    });
    firstElement.focus();
}

// Render products
async function renderProducts(filter = 'all', query = '') {
    productsGrid.innerHTML = '<div class="loader">Loading...</div>';
    try {
        const response = await fetch(`/api/products${query ? `?query=${encodeURIComponent(query)}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        let products = await response.json();
        if (filter !== 'all') {
            products = products.filter(product => product.category === filter);
        }
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const imageHtml = product.image
                ? `<img src="${product.image}" alt="${product.name} product image" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'placeholder-text\\'>${product.name}</div>'">`
                : `<div class="placeholder-text">${product.name}</div>`;
            productCard.innerHTML = `
                <div class="product-image">${imageHtml}</div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button class="btn add-to-cart" data-name="${product.name}" data-price="${product.price}" aria-label="Add ${product.name} to cart">Add to Cart</button>
                        <button class="btn btn-outline view-details" data-name="${product.name}" aria-label="View details for ${product.name}">Details</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error rendering products:', error);
        productsGrid.innerHTML = '';
        showNotification('Failed to load products.', 'error');
    }
}

// Show product details modal
function showProductDetails(name) {
    fetch(`/api/products?name=${encodeURIComponent(name)}`)
        .then(response => response.json())
        .then(products => {
            const product = products[0];
            if (!product) {
                showNotification('Product not found.', 'error');
                return;
            }
            const imageHtml = product.image
                ? `<img src="${product.image}" alt="${product.name} product image" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'placeholder-text\\'>${product.name}</div>'">`
                : `<div class="placeholder-text">${product.name}</div>`;
            modalContent.innerHTML = `
                <div class="modal-image">${imageHtml}</div>
                <div class="modal-details">
                    <h2>${product.name}</h2>
                    <div class="modal-price">$${product.price.toFixed(2)}</div>
                    <div class="modal-description"><p>${product.fullDescription}</p></div>
                    <div class="modal-usage">
                        <h3>Usage Instructions</h3>
                        <p>${product.usage}</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn add-to-cart-modal" data-name="${product.name}" data-price="${product.price}" aria-label="Add ${product.name} to cart">Add to Cart</button>
                    </div>
                </div>
            `;
            productModal.classList.add('active');
            trapFocus(productModal, true);
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showNotification('Failed to load product details.', 'error');
        });
}

// Add product to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
    showNotification(`${name} added to cart!`, 'success');
    gtag('event', 'add_to_cart', { item_name: name });
}

// Update cart UI
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        fetch(`/api/products?name=${encodeURIComponent(item.name)}`)
            .then(response => response.json())
            .then(products => {
                const product = products[0];
                const imageHtml = product?.image
                    ? `<img src="${product.image}" alt="${item.name} cart image" loading="lazy" onerror="this.style.display='none'">`
                    : '';
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">${imageHtml}</div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-qty" data-index="${index}" aria-label="Decrease quantity of ${item.name}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}" aria-label="Quantity of ${item.name}">
                            <button class="quantity-btn increase-qty" data-index="${index}" aria-label="Increase quantity of ${item.name}">+</button>
                            <button class="remove-item" data-index="${index}" aria-label="Remove ${item.name} from cart"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    updateCartCount();
    saveCart();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Set up event listeners
function setupEventListeners() {
    // Cart toggle
    cartToggle.addEventListener('click', e => {
        e.preventDefault();
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        trapFocus(cartSidebar, true);
    });

    // Close cart
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        trapFocus(cartSidebar, false);
    });

    // Close cart overlay
    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        trapFocus(cartSidebar, false);
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        productModal.classList.remove('active');
        trapFocus(productModal, false);
    });

    // Close modal on overlay click
    productModal.addEventListener('click', e => {
        if (e.target === productModal) {
            productModal.classList.remove('active');
            trapFocus(productModal, false);
        }
    });

    // Add to cart and view details
    document.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart') || e.target.classList.contains('add-to-cart-modal')) {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            addToCart(name, price);
            if (e.target.classList.contains('add-to-cart-modal')) {
                productModal.classList.remove('active');
            }
        }
        if (e.target.classList.contains('view-details')) {
            const name = e.target.getAttribute('data-name');
            showProductDetails(name);
        }
    });

    // Cart quantity buttons
    document.addEventListener('click', e => {
        if (e.target.classList.contains('decrease-qty')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                updateCart();
            }
        }
        if (e.target.classList.contains('increase-qty')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart[index].quantity += 1;
            updateCart();
        }
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
        }
    });

    // Quantity input change
    document.addEventListener('change', e => {
        if (e.target.classList.contains('quantity-input')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            const newQuantity = parseInt(e.target.value);
            if (newQuantity >= 1) {
                cart[index].quantity = newQuantity;
                updateCart();
            } else {
                e.target.value = cart[index].quantity;
                showNotification('Quantity must be at least 1.', 'error');
            }
        }
    });

    // Checkout
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<div class="loader">Loading...</div>';
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            });
            if (!response.ok) throw new Error('Checkout failed');
            const { sessionId } = await response.json();
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Checkout error:', error);
            showNotification('Checkout failed. Please try again.', 'error');
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = 'Proceed to Checkout';
        }
    });

    // Mobile menu toggle
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.remove('active');
        });
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            renderProducts(filter, productSearch.value);
        });
    });

    // Product filter links in footer
    productFilters.forEach(filter => {
        filter.addEventListener('click', e => {
            e.preventDefault();
            const filterValue = filter.getAttribute('data-filter');
            filterBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.filter-btn[data-filter="${filterValue}"]`).classList.add('active');
            renderProducts(filterValue, productSearch.value);
            window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
        });
    });

    // Contact form submission
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
        };

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showNotification('Please fill out all fields.', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
            } else {
                const { error } = await response.json();
                showNotification(error || 'Failed to send message.', 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showNotification('An error occurred. Please try again later.', 'error');
        }
    });

    // Product search
    productSearch.addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderProducts(activeFilter, productSearch.value);
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('darkMode', 'true');
        } else {
            darkModeToggle.textContent = '🌙 Dark Mode';
            localStorage.setItem('darkMode', 'false');
        }
    });
}

// Initialize
init();
