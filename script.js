// Variáveis globais
let products = [];
let cart = [];

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

// Funções auxiliares

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
      li.textContent = `${item.name} - ${formatarParaReal(item.price)} x ${item.quantity}`;
      
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remover';
      removeButton.onclick = () => removeFromCart(index);
      
      li.appendChild(removeButton);
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
  
  products.forEach((product, index) => {
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
          <h3>${product.name}</h3>
          <p>${formatarParaReal(product.price)}</p>
          <button onclick="addToCart(products[${index}])">Adicionar ao Carrinho</button>
          <button onclick="editProduct(${index})">Editar</button>
          <button onclick="deleteProduct(${index})">Excluir</button>
      `;
      productGrid.appendChild(productElement);
  });
  
  saveToLocalStorage('products', products);
}
function addProduct(name, price) {
            const product = { id: generateId(), name, price: parseFloat(price) };
            products.push(product);
            saveProducts();
            renderProducts();
        }

        function editProduct(id, name, price) {
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], name, price: parseFloat(price) };
                saveProducts();
                renderProducts();
            }
        }

        function deleteProduct(id) {
            products = products.filter(p => p.id !== id);
            saveProducts();
            renderProducts();
        }
function addProduct(name, price) {
  products.push({ name, price: parseFloat(price.replace(',', '.')) });
  updateProductMenu();
}

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
});

document.addEventListener('click', (event) => {
    if (!cartMenu.contains(event.target) && event.target !== cartIcon) {
        cartMenu.classList.add('hidden');
    }
});

addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    addProduct(name, price);
    addProductForm.reset();
});

paymentMethod.addEventListener('change', () => {
    cashPayment.classList.toggle('hidden', paymentMethod.value !== 'cash');
});

calculateChange.addEventListener('click', calculateChangeAmount);
processPayment.addEventListener('click', processPaymentTransaction);

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