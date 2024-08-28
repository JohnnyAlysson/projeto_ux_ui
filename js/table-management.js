let mesas = {};
let fecharMesaCallback = null;

export function setFecharMesaCallback(callback) {
    fecharMesaCallback = callback;
}

export function abrirMesa(numeroMesa) {
    if (!mesas[numeroMesa]) {
        mesas[numeroMesa] = { carrinho: [], totalAbatido: 0, pagamentosParciais: [] };
        renderTabs();
    } else {
        console.warn(`A mesa ${numeroMesa} já está aberta.`);
    }
    return numeroMesa;
}

export function fecharMesa(numeroMesa) {
    if (fecharMesaCallback) {
        fecharMesaCallback(numeroMesa);
    }
}

export function adicionarAoCarrinho(produto, quantidade, numeroMesa) {
    const mesa = mesas[numeroMesa];
    if (!mesa) {
        console.error(`Mesa ${numeroMesa} não encontrada.`);
        return;
    }
    const itemExistente = mesa.carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        mesa.carrinho.push({ ...produto, quantidade: quantidade });
    }
    renderTabs();
}

export function calcularTotal(carrinho) {
    return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0).toFixed(2);
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
        tabButton.className = 'tab-button';
        tabButton.addEventListener('click', () => renderMesaContent(numeroMesa));
        tabsList.appendChild(tabButton);
    });

    renderMesaContent(Object.keys(mesas)[0]);
}

function renderMesaContent(numeroMesa) {
    const tabsContent = document.getElementById('tabsContent');
    tabsContent.innerHTML = '';

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
    verCatalogoBtn.addEventListener('click', () => window.abrirModal(numeroMesa));
    card.appendChild(verCatalogoBtn);

    const fecharMesaBtn = document.createElement('button');
    fecharMesaBtn.textContent = `Fechar Mesa ${numeroMesa}`;
    fecharMesaBtn.className = 'close-mesa-btn mt-4';
    fecharMesaBtn.addEventListener('click', () => fecharMesa(numeroMesa));
    card.appendChild(fecharMesaBtn);

    const pagamentoParcialBtn = document.createElement('button');
    pagamentoParcialBtn.textContent = 'Pagamento Parcial';
    pagamentoParcialBtn.className = 'pagamento-parcial-btn mt-4';
    pagamentoParcialBtn.addEventListener('click', () => window.abrirModalPagamentoParcial(numeroMesa));
    card.appendChild(pagamentoParcialBtn);

    tabsContent.appendChild(card);
}

export function abaterValorParcial(numeroMesa, valor) {
    const mesa = mesas[numeroMesa];
    mesa.pagamentosParciais.push(valor);
    mesa.totalAbatido = (mesa.totalAbatido || 0) + valor;
    renderTabs();
    renderResumoPagamentoParcial(numeroMesa);
}

export function renderResumoPagamentoParcial(numeroMesa) {
    const mesa = mesas[numeroMesa];
    const resumoPagamentoParcial = document.getElementById('resumoPagamentoParcial');
    const totalInicial = calcularTotal(mesa.carrinho);
    const totalAbatido = mesa.totalAbatido.toFixed(2);
    const totalRestante = (totalInicial - mesa.totalAbatido).toFixed(2);
    const pagamentosDetalhes = mesa.pagamentosParciais.map((valor, index) => `Pagamento ${index + 1}: R$ ${valor.toFixed(2)}`).join('<br>');

    resumoPagamentoParcial.innerHTML = `
    <h3>Resumo do Pagamento Parcial</h3>
    <p>Total Inicial: R$ ${totalInicial}</p>
    <p>${pagamentosDetalhes}</p>
    <p>Total Abatido: R$ ${totalAbatido}</p>
    <p>Total Pendente: R$ ${totalRestante}</p>
    `;
}

export function finalizarPedido(numeroMesa, metodoPagamento, observacoes, incluirServico) {
    const mesa = mesas[numeroMesa];
    let total = parseFloat(calcularTotal(mesa.carrinho));
    let servico = 0;
    if (incluirServico) {
        servico = total * 0.10;
        total += servico;
    }
    const totalPendente = total - mesa.totalAbatido;
    const dadosRecibo = {
        numeroMesa,
        metodoPagamento,
        observacoes,
        carrinho: mesa.carrinho,
        total,
        servico,
        totalPendente,
        pagamentosParciais: mesa.pagamentosParciais,
        totalAbatido: mesa.totalAbatido
    };
    localStorage.setItem('recibo', JSON.stringify(dadosRecibo));
    window.open('recibo.html', '_blank');
    delete mesas[numeroMesa];
    renderTabs();
}