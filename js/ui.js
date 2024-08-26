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
}

export function showAlert(message) {
    alert(message);
}

export function confirmAction(message) {
    return confirm(message);
}