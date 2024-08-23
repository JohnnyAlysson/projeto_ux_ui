// ui.js
import { getCurrentUser, isAdmin } from './auth.js';
import { renderProdutos } from './produto.js';
import { renderTabs } from './mesa.js';

export function initializeUI() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('currentUserName').textContent = `Usuário: ${currentUser.username}`;
        if (isAdmin()) {
            showAdminFeatures();
        } else {
            hideAdminFeatures();
        }
    }
    renderTabs();
    renderProdutos();
}

export function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

export function hideLoginScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

export function showAdminFeatures() {
    document.getElementById('btnNovoProduto').style.display = 'inline-block';
    document.getElementById('btnVerHistorico').style.display = 'inline-block';
}

export function hideAdminFeatures() {
    document.getElementById('btnNovoProduto').style.display = 'none';
    document.getElementById('btnVerHistorico').style.display = 'none';
}

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error(`Modal with id "${modalId}" not found`);
    }
}


export function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    console.log("working")
}

export function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        console.log("working")
    });
}

export function showAlert(message) {
    alert(message);
}

export function updateMesaInfo(numeroMesa) {
    const mesaInfoElement = document.getElementById('mesaInfo');
    if (mesaInfoElement) {
        mesaInfoElement.textContent = `Mesa Atual: ${numeroMesa}`;
    }
}

export function updateTotalDisplay(total) {
    const totalDisplay = document.getElementById('totalDisplay');
    if (totalDisplay) {
        totalDisplay.textContent = `Total: R$ ${total.toFixed(2)}`;
    }
}

export function clearInputField(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
    }
}

export function disableButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
    }
}

export function enableButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
    }
}

export function toggleButtonVisibility(buttonId, isVisible) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.style.display = isVisible ? 'inline-block' : 'none';
    }
}

export function setInputValue(inputId, value) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = value;
    }
}

export function getInputValue(inputId) {
    const input = document.getElementById(inputId);
    return input ? input.value : null;
}

export function focusInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.focus();
    }
}

export function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

export function toggleElementClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle(className);
    }
}

export function createElementWithClass(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;
    return element;
}

export function confirmAction(message) {
    return confirm(message);
}

export function appendChildToElement(parentId, childElement) {
    const parent = document.getElementById(parentId);
    if (parent) {
        parent.appendChild(childElement);
    }
}

export function removeChildFromElement(parentId, childId) {
    const parent = document.getElementById(parentId);
    const child = document.getElementById(childId);
    if (parent && child) {
        parent.removeChild(child);
    }
}

export function setElementAttribute(elementId, attributeName, attributeValue) {
    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute(attributeName, attributeValue);
    }
}

export function getElementAttribute(elementId, attributeName) {
    const element = document.getElementById(elementId);
    return element ? element.getAttribute(attributeName) : null;
}

export function addEventListenerToElement(elementId, eventType, listener) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, listener);
    }
}

export function removeEventListenerFromElement(elementId, eventType, listener) {
    const element = document.getElementById(elementId);
    if (element) {
        element.removeEventListener(eventType, listener);
    }
}

export function updateUIForLoggedInUser(user) {
    document.getElementById('currentUserName').textContent = `Usuário: ${user.username}`;
    if (isAdmin()) {
        showAdminFeatures();
    } else {
        hideAdminFeatures();
    }
    hideLoginScreen();
    document.getElementById('mainContent').style.display = 'block';
}

export function updateUIForLoggedOutUser() {
    document.getElementById('currentUserName').textContent = '';
    hideAdminFeatures();
    showLoginScreen();
    document.getElementById('mainContent').style.display = 'none';
}

export function clearCartDisplay() {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.innerHTML = '';
    }
}

export function updateCartDisplay(cart) {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.textContent = `${item.nome} - Quantidade: ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}`;
            cartContainer.appendChild(itemElement);
        });
    }
}

export function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
}

export function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

export function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}

export function hideErrorMessage() {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
    }
}

export function updateProductList(products) {
    const productList = document.getElementById('productList');
    if (productList) {
        productList.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <h3>${product.nome}</h3>
                <p>${product.descricao}</p>
                <p>Preço: R$ ${product.preco.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productList.appendChild(productElement);
        });
    }
}

export function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">Todas as Categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
}

// Add any additional UI-related functions here