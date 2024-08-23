// mesa.js
import { showAlert, openModal } from './ui.js';
import { calcularTotal, formatarMoeda } from './utils.js';
import { renderProdutos, getProdutoById } from './produto.js';
import { abrirModalFinalizarPedido } from './pagamento.js';

export let mesas = {};
export let mesaAtual = null;

function updateMesaInfo(numeroMesa) {
    const mesaInfoElement = document.getElementById('mesaInfo');
    if (mesaInfoElement) {
        mesaInfoElement.textContent = `Mesa Atual: ${numeroMesa}`;
    }
}

export function abrirMesa(numeroMesa) {
    console.log(`Abrindo mesa ${numeroMesa}`);
    if (!mesas[numeroMesa]) {
        mesas[numeroMesa] = { carrinho: [], totalAbatido: 0, pagamentosParciais: [] };
        console.log(`Nova mesa criada: ${numeroMesa}`);
    } else {
        console.log(`Mesa existente aberta: ${numeroMesa}`);
    }
    mesaAtual = numeroMesa;
    updateMesaInfo(numeroMesa);
    renderTabs();
    renderProdutos();
    console.log('Estado atual das mesas:', mesas);
    console.log('Mesa atual:', mesaAtual);
}

export function renderTabs() {
    const tabsList = document.getElementById('tabsList');
    const tabsContent = document.getElementById('tabsContent');

    tabsList.innerHTML = '';
    tabsContent.innerHTML = '';

    if (Object.keys(mesas).length === 0) {
        tabsContent.innerHTML = '<p>Nenhuma mesa aberta. Abra uma mesa para começar.</p>';
        return;
    }

    Object.keys(mesas).forEach(numeroMesa => {
        const tabButton = document.createElement('button');
        tabButton.textContent = `Mesa ${numeroMesa}`;
        tabButton.className = mesaAtual === numeroMesa ? 'active' : '';
        tabButton.addEventListener('click', () => {
            mesaAtual = numeroMesa;
            renderTabs();
        });
        tabsList.appendChild(tabButton);

        if (mesaAtual === numeroMesa) {
            const mesa = mesas[numeroMesa];
            const card = document.createElement('div');
            card.className = 'card';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-content';
            cardHeader.innerHTML = `<h3>Carrinho - Mesa ${numeroMesa}</h3>`;
            card.appendChild(cardHeader);

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="text-left">Item</th>
                        <th class="text-right">Qtd</th>
                        <th class="text-right">Preço</th>
                        <th class="text-right">Subtotal</th>
                        <th class="text-center">Ações</th>
                    </tr>
                </thead>
            `;
            const tbody = document.createElement('tbody');
            mesa.carrinho.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.nome}</td>
                    <td class="text-right">${item.quantidade}</td>
                    <td class="text-right">${formatarMoeda(item.preco)}</td>
                    <td class="text-right">${formatarMoeda(item.preco * item.quantidade)}</td>
                    <td class="text-center">
                        <button class="btn-remove" data-id="${item.id}">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            card.appendChild(table);

            const total = calcularTotal(mesa.carrinho);
            const totalAbatido = mesa.totalAbatido || 0;
            const pendente = total - totalAbatido;

            const totalDiv = document.createElement('div');
            totalDiv.className = 'font-bold mt-4 text-right';
            totalDiv.innerHTML = `
                Total: ${formatarMoeda(total)}<br>
                Total Abatido: ${formatarMoeda(totalAbatido)}<br>
                Pendente: ${formatarMoeda(pendente)}
            `;
            card.appendChild(totalDiv);

            const verCatalogoBtn = document.createElement('button');
            verCatalogoBtn.textContent = 'Ver Catálogo de Produtos';
            verCatalogoBtn.className = 'w-full mb-4';
            verCatalogoBtn.addEventListener('click', () => openModal('modal'));
            card.appendChild(verCatalogoBtn);

            const finalizarPedidoBtn = document.createElement('button');
            finalizarPedidoBtn.textContent = `Finalizar Pedido Mesa ${numeroMesa}`;
            finalizarPedidoBtn.className = 'finalizar-pedido-btn mt-4';
            finalizarPedidoBtn.dataset.mesa = numeroMesa;
            finalizarPedidoBtn.addEventListener('click', () => abrirModalFinalizarPedido(parseInt(numeroMesa)));
            card.appendChild(finalizarPedidoBtn);

            tabsContent.appendChild(card);

            // Add event listeners for remove buttons
            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = parseInt(e.target.dataset.id);
                    removerItemDoCarrinho(mesaAtual, itemId);
                });
            });
        }
    });
}

export function adicionarAoCarrinho(produto, quantidade, numeroMesa) {
    console.log(`Adicionando ao carrinho da mesa ${numeroMesa}:`, produto, quantidade);
    if (!mesas[numeroMesa]) {
        showAlert(`Erro: Mesa ${numeroMesa} não encontrada. Por favor, abra a mesa primeiro.`);
        return;
    }
    const mesa = mesas[numeroMesa];
    const itemExistente = mesa.carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        mesa.carrinho.push({ ...produto, quantidade: quantidade });
    }
    renderTabs();
    showAlert(`${quantidade} ${produto.nome}(s) adicionado(s) ao carrinho da Mesa ${numeroMesa}.`);
}

export function removerItemDoCarrinho(numeroMesa, itemId) {
    console.log(`Removendo item ${itemId} do carrinho da mesa ${numeroMesa}`);
    const mesa = mesas[numeroMesa];
    mesa.carrinho = mesa.carrinho.filter(item => item.id !== itemId);
    renderTabs();
}

export function limparMesa(numeroMesa) {
    console.log(`Limpando mesa ${numeroMesa}`);
    if (mesas[numeroMesa]) {
        delete mesas[numeroMesa];
        if (mesaAtual === numeroMesa) {
            mesaAtual = null;
        }
        renderTabs();
        console.log(`Mesa ${numeroMesa} limpa com sucesso`);
    } else {
        console.error(`Tentativa de limpar mesa inexistente: ${numeroMesa}`);
    }
}

export function getMesaAtual() {
    return mesaAtual;
}

export function getCarrinhoMesa(numeroMesa) {
    return mesas[numeroMesa] ? mesas[numeroMesa].carrinho : [];
}

export function getTotalMesa(numeroMesa) {
    if (!mesas[numeroMesa]) return 0;
    return calcularTotal(mesas[numeroMesa].carrinho);
}

export function getTotalAbatidoMesa(numeroMesa) {
    return mesas[numeroMesa] ? mesas[numeroMesa].totalAbatido : 0;
}

export function getPagamentosParciais(numeroMesa) {
    return mesas[numeroMesa] ? mesas[numeroMesa].pagamentosParciais : [];
}

export function atualizarTotalAbatido(numeroMesa, novoTotal) {
    console.log(`Atualizando total abatido da mesa ${numeroMesa} para ${novoTotal}`);
    if (mesas[numeroMesa]) {
        mesas[numeroMesa].totalAbatido = novoTotal;
        renderTabs();
    }
}

export function adicionarPagamentoParcial(numeroMesa, valor) {
    console.log(`Adicionando pagamento parcial de ${valor} à mesa ${numeroMesa}`);
    if (mesas[numeroMesa]) {
        mesas[numeroMesa].pagamentosParciais.push(valor);
        mesas[numeroMesa].totalAbatido += valor;
        renderTabs();
    }
}

export function getMesa(numeroMesa) {
    return mesas[numeroMesa];
}

export function existeMesa(numeroMesa) {
    return !!mesas[numeroMesa];
}