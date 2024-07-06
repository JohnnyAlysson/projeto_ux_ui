// Variáveis globais
let products = [];
let cart = [];
let currentCategory = 'todos';

// Elementos do DOM
const productGrid = document.getElementById('product-grid');
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.getElementById('cart-badge');
const cartMenu = document.getElementById('cart-menu');
const cartItems = document.getElementById('cart-items');
const totalAmount = document.getElementById('total-amount');
const addProductForm = document.getElementById('add-product-form');
const paymentMethod = document.getElementById('payment-method');
const cashPayment = document.getElementById('cash-payment');
const cashAmount = document.getElementById('cash-amount');
const calculateChange = document.getElementById('calculate-change');
const processPayment = document.getElementById('process-payment');
const categoryButtons = document.querySelectorAll('.category-btn');

// Funções auxiliares
function editProduct(index) {
  const newName = prompt('Novo nome do produto:', products[index].name);
  const newPrice = prompt('Novo preço do produto:', formatarParaReal(products[index].price).replace('R$', '').trim());
  
  if (newName && newPrice) {
      products[index].name = newName;
      products[index].price = parseFloat(newPrice.replace(',', '.'));
      updateProductMenu();
  }
}

function deleteProduct(index) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products.splice(index, 1);
        updateProductMenu();
    }
}

function formatarParaReal(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function updateCartBadge() {
    cartBadge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} - ${formatarParaReal(item.price)} x ${item.quantity}</span>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartItems.appendChild(li);
        
        total += item.price * item.quantity;
    });

    totalAmount.textContent = formatarParaReal(total).replace('R$', '').trim();
    updateCartBadge();
    saveToLocalStorage('cart', cart);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartDisplay();
}

function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    
    updateCartDisplay();
}

function updateProductMenu() {
    productGrid.innerHTML = '';
    
    products.filter(product => currentCategory === 'todos' || product.category === currentCategory).forEach((product, index) => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${formatarParaReal(product.price)}</p>
            <button onclick="addToCart(products[${index}])">Adicionar <i class="fas fa-cart-plus"></i></button>
            <div class ="product-edit-remove">
            <button onclick="editProduct(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteProduct(${index})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        productGrid.appendChild(productElement);
    });
    
    saveToLocalStorage('products', products);
}

function addProduct(name, price, category) {
    const newProduct = {
        id: generateId(),
        name,
        price: parseFloat(price.replace(',', '.')),
        category
    };
    products.push(newProduct);
    updateProductMenu();
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function calculateChangeAmount() {
    const total = parseFloat(totalAmount.textContent.replace(',', '.'));
    const paid = parseFloat(cashAmount.value.replace(',', '.'));
    
    if (paid >= total) {
        const change = paid - total;
        alert(`Troco: ${formatarParaReal(change)}`);
    } else {
        alert('Valor insuficiente!');
    }
}

function processPaymentTransaction() {
    const total = parseFloat(totalAmount.textContent.replace(',', '.'));
    const method = paymentMethod.value;
    
    if (method === 'cash') {
        const paid = parseFloat(cashAmount.value.replace(',', '.'));
        if (paid < total) {
            alert('Valor insuficiente!');
            return;
        }
    }
    
    alert(`Pagamento de ${formatarParaReal(total)} processado com sucesso via ${method}!`);
    cart = [];
    updateCartDisplay();
    cartMenu.classList.add('hidden');
}

// Event Listeners
cartIcon.addEventListener('click', () => {
  cartMenu.classList.toggle('hidden');
  console.log('Cart clicked, visibility:', !cartMenu.classList.contains('hidden')); // Para depuração
});


addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    addProduct(name, price, category);
    addProductForm.reset();
});

paymentMethod.addEventListener('change', () => {
    cashPayment.classList.toggle('hidden', paymentMethod.value !== 'cash');
});

calculateChange.addEventListener('click', calculateChangeAmount);
processPayment.addEventListener('click', processPaymentTransaction);

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        updateProductMenu();
    });
});

// Inicialização
window.onload = () => {
    const savedProducts = loadFromLocalStorage('products');
    if (savedProducts) {
        products = savedProducts;
        updateProductMenu();
    }
    
    const savedCart = loadFromLocalStorage('cart');
    if (savedCart) {
        cart = savedCart;
        updateCartDisplay();
    }
};