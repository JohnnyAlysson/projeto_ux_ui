document.addEventListener("DOMContentLoaded", () => {
    const products = [
    { id: 1, name: "Espresso", price: 2.5 },
    { id: 2, name: "Cappuccino", price: 3.75 },
    { id: 3, name: "Latte", price: 4.0 },
    { id: 4, name: "Americano", price: 3.0 },
    { id: 5, name: "Mocha", price: 4.25 },
    { id: 6, name: "Tea", price: 2.0 }
    ];
    const cart = [];
    const cartButton = document.querySelector(".cart-button");
    const cartCount = document.querySelector(".cart-count");
    const cartDropdown = document.querySelector(".cart-dropdown");
    const productGrid = document.querySelector(".product-grid");
    const paymentSelect = document.querySelector(".payment-select");
    const cashInputContainer = document.querySelector(".cash-input-container");
    const cashInput = document.querySelector(".cash-input");
    const changeContainer = document.querySelector(".change-container");
    const changeAmount = document.querySelector(".change-amount");
    
    const updateCartCount = () => {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? "flex" : "none";
        cartDropdown.style.display = cart.length > 0 ? "block" : "none";
        renderCart();
    };
    
    const renderCart = () => {
        cartDropdown.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Cart</h3>
            <ul class="space-y-2">
                ${cart.map((item, index) => `
                    <li key=${index} class="flex justify-between items-center">
                        <span>${item.name}</span>
                        <div class="flex items-center gap-2">
                            <span>$${item.price.toFixed(2)}</span>
                            <button class="remove-button" data-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <div class="mt-4 flex justify-end">
                <button class="close-button">Close</button>
            </div>
        `;
    
        cartDropdown.querySelectorAll(".remove-button").forEach(button => {
            button.addEventListener("click", (event) => {
                const index = event.currentTarget.dataset.index;
                cart.splice(index, 1);
                updateCartCount();
            });
        });
    
        const closeButton = cartDropdown.querySelector(".close-button");
        closeButton.addEventListener("click", () => {
            cartDropdown.style.display = "none";
        });
    };
    
    const addToCart = (product) => {
        cart.push(product);
        updateCartCount();
    };
    
    const renderProducts = () => {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-button" data-id="${product.id}">Add to Cart</button>
            </div>
        `).join('');
    
        document.querySelectorAll(".add-to-cart-button").forEach(button => {
            button.addEventListener("click", (event) => {
                const id = event.currentTarget.dataset.id;
                const product = products.find(p => p.id === parseInt(id));
                addToCart(product);
            });
        });
    };
    
    paymentSelect.addEventListener("change", () => {
        const paymentMethod = paymentSelect.value;
        if (paymentMethod === "cash") {
            cashInputContainer.style.display = "block";
        } else {
            cashInputContainer.style.display = "none";
            changeContainer.style.display = "none";
            cashInput.value = "";
        }
    });
    
    cashInput.addEventListener("input", () => {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const cashPaid = parseFloat(cashInput.value);
        const change = cashPaid - total;
        changeAmount.textContent = change >= 0 ? `$${change.toFixed(2)}` : "$0.00";
        changeContainer.style.display = change >= 0 ? "block" : "none";
    });
    
    cartButton.addEventListener("click", () => {
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });
    
    renderProducts();
    updateCartCount();
    });