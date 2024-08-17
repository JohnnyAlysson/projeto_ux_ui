// mesa.js
import { openModal, updateMesaInfo, showAlert } from './ui.js';
import { calcularTotal } from './utils.js';
import { renderProdutos } from './produto.js';

export let mesas = {};
export let mesaAtual = null;

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

export function fecharMesa(numeroMesa) {
    if (mesas[numeroMesa] && mesas[numeroMesa].carrinho.length > 0) {
        openModal('modalPagamento');
    } else {
        showAlert('Não é possível fechar uma mesa vazia.');
    }
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
                    <td class="text-right">R$ ${item.preco.toFixed(2)}</td>
                    <td class="text-right">R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn-remove" data-id="${item.id}">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            card.appendChild(table);

            const totalDiv = document.createElement('div');
            totalDiv.className = 'font-bold mt-4 text-right';
            totalDiv.innerHTML = `
                Total: R$ ${calcularTotal(mesa.carrinho)}<br>
                Total Abatido: R$ ${mesa.totalAbatido.toFixed(2)}<br>
                Pendente: R$ ${(calcularTotal(mesa.carrinho) - mesa.totalAbatido).toFixed(2)}
            `;
            card.appendChild(totalDiv);

            const verCatalogoBtn = document.createElement('button');
            verCatalogoBtn.textContent = 'Ver Catálogo de Produtos';
            verCatalogoBtn.className = 'w-full mb-4';
            verCatalogoBtn.addEventListener('click', () => openModal('modal'));
            card.appendChild(verCatalogoBtn);

            const fecharMesaBtn = document.createElement('button');
            fecharMesaBtn.textContent = `Fechar Mesa ${numeroMesa}`;
            fecharMesaBtn.className = 'close-mesa-btn mt-4';
            fecharMesaBtn.addEventListener('click', () => fecharMesa(mesaAtual));
            card.appendChild(fecharMesaBtn);

            const pagamentoParcialBtn = document.createElement('button');
            pagamentoParcialBtn.textContent = 'Pagamento Parcial';
            pagamentoParcialBtn.className = 'pagamento-parcial-btn mt-4';
            pagamentoParcialBtn.addEventListener('click', () => openModal('modalPagamentoParcial'));
            card.appendChild(pagamentoParcialBtn);

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
        mesas[numeroMesa] = { carrinho: [], totalAbatido: 0, pagamentosParciais: [] };
        if (mesaAtual === numeroMesa) {
            renderTabs();
        }
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

export function transferirMesa(mesaOrigem, mesaDestino) {
    console.log(`Transferindo mesa ${mesaOrigem} para mesa ${mesaDestino}`);
    if (mesas[mesaOrigem] && !mesas[mesaDestino]) {
        mesas[mesaDestino] = { ...mesas[mesaOrigem] };
        delete mesas[mesaOrigem];
        if (mesaAtual === mesaOrigem) {
            mesaAtual = mesaDestino;
        }
        renderTabs();
        showAlert(`Mesa ${mesaOrigem} transferida para Mesa ${mesaDestino}.`);
    } else {
        showAlert('Não foi possível transferir a mesa. Verifique se a mesa de origem existe e a de destino está livre.');
    }
}

export function unirMesas(mesa1, mesa2) {
    console.log(`Unindo mesas ${mesa1} e ${mesa2}`);
    if (mesas[mesa1] && mesas[mesa2]) {
        mesas[mesa1].carrinho = [...mesas[mesa1].carrinho, ...mesas[mesa2].carrinho];
        mesas[mesa1].totalAbatido += mesas[mesa2].totalAbatido;
        mesas[mesa1].pagamentosParciais = [...mesas[mesa1].pagamentosParciais, ...mesas[mesa2].pagamentosParciais];
        delete mesas[mesa2];
        renderTabs();
        showAlert(`Mesas ${mesa1} e ${mesa2} foram unidas na Mesa ${mesa1}.`);
    } else {
        showAlert('Não foi possível unir as mesas. Verifique se ambas existem.');
    }
}

export function getMesa(numeroMesa) {
    return mesas[numeroMesa];
}

export function existeMesa(numeroMesa) {
    return !!mesas[numeroMesa];
}