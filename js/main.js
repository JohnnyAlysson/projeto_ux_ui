// main.js
import { login, logout, isLoggedIn, getCurrentUser } from './auth.js';
import { initializeUI, openModal, closeModal, showAlert, showLoginScreen, hideLoginScreen } from './ui.js';
import { loadProdutos, renderProdutos, adicionarNovoProduto, editarProduto, removerProduto, getProdutoById } from './produto.js';
import { abrirMesa, fecharMesa, renderTabs, adicionarAoCarrinho, getMesaAtual, getMesa, existeMesa } from './mesa.js';
import { abaterValorParcial, finalizarPedido } from './pagamento.js';
import { loadHistoricoVendas, renderHistoricoVendas, exportarHistoricoCSV } from './historico.js';
import { formatarMoeda } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const mesaInput = document.getElementById('mesaInput');
    const abrirMesaBtn = document.getElementById('abrirMesaBtn');
    const categoriaSelect = document.getElementById('categoriaSelect');
    const formPagamento = document.getElementById('formPagamento');
    const formPagamentoParcial = document.getElementById('formPagamentoParcial');
    const formNovoProduto = document.getElementById('formNovoProduto');
    const btnNovoProduto = document.getElementById('btnNovoProduto');
    const btnVerHistorico = document.getElementById('btnVerHistorico');
    const btnExportarCSV = document.getElementById('btnExportarCSV');


    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      login(username, password)
          .then((user) => {
              hideLoginScreen();
              initializeUI();
              loadProdutos().then(renderProdutos);
              loadHistoricoVendas();
          })
          .catch(error => showAlert(error.message));
    });

    logoutBtn.addEventListener('click', () => {
        logout();
        resetUIState();
        showLoginScreen();
    });

    abrirMesaBtn.addEventListener('click', () => {
        const numeroMesa = parseInt(mesaInput.value, 10);
        if (!isNaN(numeroMesa) && numeroMesa > 0 && numeroMesa <= 99) {
            abrirMesa(numeroMesa);
            console.log(`Mesa ${numeroMesa} aberta. Mesa atual:`, getMesaAtual());
        } else {
            showAlert("Por favor, insira um número de mesa válido (1-99).");
        }
    });

    categoriaSelect.addEventListener('change', () => {
        const categoria = categoriaSelect.value;
        renderProdutos(categoria);
    });

    formPagamento.addEventListener('submit', (e) => {
        e.preventDefault();
        const mesaAtual = getMesaAtual();
        if (!mesaAtual) {
            showAlert("Nenhuma mesa selecionada. Por favor, abra uma mesa primeiro.");
            return;
        }
        const metodoPagamento = document.getElementById('metodoPagamento').value;
        const observacoes = document.getElementById('observacoes').value;
        const incluirServico = document.getElementById('incluirServico').checked;
        finalizarPedido(mesaAtual, metodoPagamento, observacoes, incluirServico);
        closeModal('modalPagamento');
        renderTabs();
    });

    formPagamentoParcial.addEventListener('submit', (e) => {
        e.preventDefault();
        const mesaAtual = getMesaAtual();
        console.log('Tentando fazer pagamento parcial. Mesa atual:', mesaAtual);
        if (!mesaAtual) {
            showAlert("Nenhuma mesa selecionada. Por favor, abra uma mesa primeiro.");
            return;
        }
        if (!existeMesa(mesaAtual)) {
            showAlert(`Erro: Mesa ${mesaAtual} não encontrada.`);
            return;
        }
        const valorPagamentoParcial = parseFloat(document.getElementById('valorPagamentoParcial').value);
        if (!isNaN(valorPagamentoParcial) && valorPagamentoParcial > 0) {
            abaterValorParcial(mesaAtual, valorPagamentoParcial);
            closeModal('modalPagamentoParcial');
            renderTabs();
        } else {
            showAlert("Por favor, insira um valor válido para o pagamento parcial.");
        }
    });

    formNovoProduto.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeProduto').value;
        const preco = parseFloat(document.getElementById('precoProduto').value);
        const descricao = document.getElementById('descricaoProduto').value;
        const categoria = document.getElementById('categoriaProduto').value;
        const imagemFile = document.getElementById('imagemProduto').files[0];

        if (imagemFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imagemPath = event.target.result;
                adicionarNovoProduto(nome, preco, descricao, categoria, imagemPath);
                closeModal('modalNovoProduto');
            };
            reader.readAsDataURL(imagemFile);
        } else {
            showAlert("Por favor, selecione uma imagem para o produto.");
        }
    });

    btnNovoProduto.addEventListener('click', () => {
        openModal('modalNovoProduto');
    });

    btnVerHistorico.addEventListener('click', () => {
        renderHistoricoVendas();
        openModal('modalHistorico');
    });

    btnExportarCSV.addEventListener('click', exportarHistoricoCSV);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });

    // Initialize product editing
    document.getElementById('produtosContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const produtoId = parseInt(e.target.dataset.id);
            const produto = getProdutoById(produtoId);
            if (produto) {
                document.getElementById('editProdutoId').value = produto.id;
                document.getElementById('editNomeProduto').value = produto.nome;
                document.getElementById('editPrecoProduto').value = produto.preco;
                document.getElementById('editDescricaoProduto').value = produto.descricao;
                document.getElementById('editCategoriaProduto').value = produto.categoria;
                openModal('modalEditarProduto');
            }
        } else if (e.target.classList.contains('remove-btn')) {
            const produtoId = parseInt(e.target.dataset.id);
            if (confirm('Tem certeza que deseja remover este produto?')) {
                removerProduto(produtoId);
            }
        }
    });


    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-mesa-btn')) {
            const numeroMesa = parseInt(e.target.dataset.mesa, 10);
            console.log(`Botão de fechar mesa clicado para mesa ${numeroMesa}`);
            if (!isNaN(numeroMesa)) {
                fecharMesa(numeroMesa);
            } else {
                console.error('Número de mesa inválido:', e.target.dataset.mesa);
            }
        }
    });

    document.getElementById('formEditarProduto').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('editProdutoId').value);
        const nome = document.getElementById('editNomeProduto').value;
        const preco = parseFloat(document.getElementById('editPrecoProduto').value);
        const descricao = document.getElementById('editDescricaoProduto').value;
        const categoria = document.getElementById('editCategoriaProduto').value;
        const imagemFile = document.getElementById('editImagemProduto').files[0];

        const novosDados = { nome, preco, descricao, categoria };

        if (imagemFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                novosDados.imagem = event.target.result;
                editarProduto(id, novosDados);
                closeModal('modalEditarProduto');
            };
            reader.readAsDataURL(imagemFile);
        } else {
            editarProduto(id, novosDados);
            closeModal('modalEditarProduto');
        }
    });

    // Add to cart functionality
    document.getElementById('produtosContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const produtoId = parseInt(e.target.dataset.id);
            const quantidade = parseInt(document.querySelector(`input[data-id="${produtoId}"]`).value);
            const produto = getProdutoById(produtoId);
            const mesaAtual = getMesaAtual();
            if (!mesaAtual) {
                showAlert("Por favor, abra uma mesa antes de adicionar produtos ao carrinho.");
                return;
            }
            if (produto && !isNaN(quantidade) && quantidade > 0) {
                adicionarAoCarrinho(produto, quantidade, mesaAtual);
                showAlert(`${quantidade} ${produto.nome}(s) adicionado(s) ao carrinho da Mesa ${mesaAtual}.`);
            }
        }
    });

    // Real-time total update
    document.getElementById('produtosContainer').addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const produtoId = parseInt(e.target.dataset.id);
            const quantidade = parseInt(e.target.value);
            const produto = getProdutoById(produtoId);
            if (produto && !isNaN(quantidade) && quantidade > 0) {
                const totalElement = document.querySelector(`.total-price[data-id="${produtoId}"]`);
                totalElement.textContent = formatarMoeda(produto.preco * quantidade);
            }
        }
    });

    // Product search functionality
    const searchInput = document.getElementById('searchProdutos');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const produtos = document.querySelectorAll('.produto-card');
        produtos.forEach(produto => {
            const nome = produto.querySelector('h3').textContent.toLowerCase();
            const descricao = produto.querySelector('p').textContent.toLowerCase();
            if (nome.includes(searchTerm) || descricao.includes(searchTerm)) {
                produto.style.display = '';
            } else {
                produto.style.display = 'none';
            }
        });
    });
});

function checkLoginState() {
  if (isLoggedIn()) {
      const user = getCurrentUser();
      if (user) {
          hideLoginScreen();
          initializeUI();
          loadProdutos().then(renderProdutos);
          loadHistoricoVendas();
      } else {
          showLoginScreen();
      }
  } else {
      showLoginScreen();
  }
}


function resetUIState() {
    showLoginScreen();
    // Clear any user-specific data from the UI
    document.getElementById('currentUserName').textContent = '';
    // Hide main content
    document.getElementById('mainContent').style.display = 'none';
    // Clear any open tables or other user-specific state
    // ... add any other necessary reset operations ...
}