// produto.js
import { isAdmin } from './auth.js';
import { adicionarAoCarrinho, mesaAtual } from './mesa.js';
import { openModal, showAlert, confirmAction } from './ui.js';

let produtos = [];

export function loadProdutos() {
    return fetch('data/produtos.json')
        .then(response => response.json())
        .then(data => {
            produtos = data;
            return produtos;
        });
}

export function getProdutos() {
    return produtos;
}

export function getProdutoById(id) {
    return produtos.find(produto => produto.id === id);
}

export function renderProdutos(categoria = 'Todas') {
    const produtosContainer = document.getElementById('produtosContainer');
    produtosContainer.innerHTML = '';

    const produtosFiltrados = categoria === 'Todas' ? produtos : produtos.filter(produto => produto.categoria === categoria);

    produtosFiltrados.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = produto.imagem;
        img.alt = produto.nome;
        img.onerror = function() {
            this.src = '/assets/placeholder.jpg';
        };
        card.appendChild(img);

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        cardContent.innerHTML = `
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <p class="font-bold">R$ ${produto.preco.toFixed(2)}</p>
        `;

        const quantidadeInput = document.createElement('input');
        quantidadeInput.type = 'number';
        quantidadeInput.value = 1;
        quantidadeInput.min = 1;
        quantidadeInput.className = 'quantidade-input';

        const addButton = document.createElement('button');
        addButton.textContent = 'Adicionar ao Carrinho';
        addButton.addEventListener('click', () => {
            const quantidade = parseInt(quantidadeInput.value);
            if (!isNaN(quantidade) && quantidade > 0) {
                adicionarAoCarrinho(produto, quantidade, mesaAtual);
            }
        });
        cardContent.appendChild(quantidadeInput);
        cardContent.appendChild(addButton);

        if (isAdmin()) {
            const editarBtn = document.createElement('button');
            editarBtn.textContent = 'Editar';
            editarBtn.className = 'edit-btn';
            editarBtn.addEventListener('click', () => abrirModalEditarProduto(produto));
            cardContent.appendChild(editarBtn);

            const removerBtn = document.createElement('button');
            removerBtn.textContent = 'Remover';
            removerBtn.className = 'remove-btn';
            removerBtn.addEventListener('click', () => removerProduto(produto.id));
            cardContent.appendChild(removerBtn);
        }

        card.appendChild(cardContent);
        produtosContainer.appendChild(card);
    });
}

export function adicionarNovoProduto(nome, preco, descricao, categoria, imagemPath) {
    if (!isAdmin()) {
        throw new Error('Você não tem permissão para adicionar novos produtos.');
    }
    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
    const novoProduto = {
        id: novoId,
        nome: nome,
        preco: preco,
        descricao: descricao,
        imagem: imagemPath,
        categoria: categoria
    };
    produtos.push(novoProduto);
    renderProdutos();
    salvarProdutos();
    showAlert('Produto adicionado com sucesso!');
}

export function editarProduto(id, novosDados) {
    if (!isAdmin()) {
        throw new Error('Você não tem permissão para editar produtos.');
    }
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
        produtos[index] = { ...produtos[index], ...novosDados };
        renderProdutos();
        salvarProdutos();
        showAlert('Produto atualizado com sucesso!');
    } else {
        showAlert('Produto não encontrado.');
    }
}

export function removerProduto(id) {
    if (!isAdmin()) {
        throw new Error('Você não tem permissão para remover produtos.');
    }
    if (confirmAction('Tem certeza que deseja remover este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        renderProdutos();
        salvarProdutos();
        showAlert('Produto removido com sucesso!');
    }
}

function abrirModalEditarProduto(produto) {
    document.getElementById('editProdutoId').value = produto.id;
    document.getElementById('editNomeProduto').value = produto.nome;
    document.getElementById('editPrecoProduto').value = produto.preco;
    document.getElementById('editDescricaoProduto').value = produto.descricao;
    document.getElementById('editCategoriaProduto').value = produto.categoria;

    openModal('modalEditarProduto');
}

function salvarProdutos() {
    console.log('Produtos atualizados:', produtos);
    localStorage.setItem('produtos', JSON.stringify(produtos));
}