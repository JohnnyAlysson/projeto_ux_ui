// pagamento.js
import { getMesa, limparMesa, renderTabs } from './mesa.js';
import { calcularTotal, formatarMoeda } from './utils.js';
import { adicionarVendaAoHistorico } from './historico.js';
import { showAlert, closeModal, updateTotalDisplay } from './ui.js';

export function abaterValorParcial(numeroMesa, valor) {
    console.log(`Tentando abater valor parcial para mesa ${numeroMesa}`);
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em abaterValorParcial`);
        showAlert(`Erro: Mesa ${numeroMesa} não encontrada. Por favor, abra a mesa novamente.`);
        return;
    }
    
    const totalPendente = calcularTotal(mesa.carrinho) - mesa.totalAbatido;
    
    if (valor > totalPendente) {
        showAlert('O valor do pagamento parcial não pode ser maior que o valor pendente.');
        return;
    }
    
    mesa.pagamentosParciais.push(valor);
    mesa.totalAbatido = (mesa.totalAbatido || 0) + valor;
    updateTotalDisplay(calcularTotal(mesa.carrinho) - mesa.totalAbatido);
    showAlert(`Pagamento parcial de R$ ${formatarMoeda(valor)} realizado com sucesso.`);
    
    if (mesa.totalAbatido >= calcularTotal(mesa.carrinho)) {
        finalizarPedido(numeroMesa);
    } else {
        closeModal('modalPagamentoParcial');
        console.log(`Pagamento parcial realizado. Novo total abatido: ${mesa.totalAbatido}`);
        renderTabs();
    }
}

export function renderResumoPagamentoParcial(numeroMesa) {
    console.log(`Renderizando resumo de pagamento parcial para mesa ${numeroMesa}`);
    const resumoPagamentoParcial = document.getElementById('resumoPagamentoParcial');
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em renderResumoPagamentoParcial`);
        resumoPagamentoParcial.innerHTML = '<p>Erro: Mesa não encontrada.</p>';
        return;
    }
    
    const totalInicial = calcularTotal(mesa.carrinho);
    const totalAbatido = mesa.totalAbatido.toFixed(2);
    const totalRestante = (totalInicial - mesa.totalAbatido).toFixed(2);
    const pagamentosDetalhes = mesa.pagamentosParciais.map((valor, index) => `Pagamento ${index + 1}: R$ ${formatarMoeda(valor)}`).join('<br>');

    resumoPagamentoParcial.innerHTML = `
        <h3>Resumo do Pagamento Parcial</h3>
        <p>Total Inicial: R$ ${formatarMoeda(totalInicial)}</p>
        <p>${pagamentosDetalhes}</p>
        <p>Total Abatido: R$ ${totalAbatido}</p>
        <p>Total Pendente: R$ ${totalRestante}</p>
    `;
}

export function finalizarPedido(numeroMesa, metodoPagamento = 'N/A', observacoes = '') {
    console.log(`Iniciando finalizarPedido para mesa ${numeroMesa}`);
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em finalizarPedido`);
        showAlert(`Erro: Mesa ${numeroMesa} não encontrada. Por favor, abra a mesa novamente.`);
        return;
    }
    
    const total = parseFloat(calcularTotal(mesa.carrinho));
    console.log(`Total calculado: ${total}`);
    
    const dadosRecibo = {
        numeroMesa,
        metodoPagamento,
        observacoes,
        carrinho: mesa.carrinho,
        total: total,
        pagamentosParciais: mesa.pagamentosParciais,
        totalAbatido: mesa.totalAbatido
    };
    
    console.log('Dados do recibo:', dadosRecibo);
    localStorage.setItem('recibo', JSON.stringify(dadosRecibo));
    
    adicionarVendaAoHistorico({
        data: new Date().toLocaleString(),
        numeroMesa,
        total,
        metodoPagamento
    });

    console.log('Limpando mesa');
    limparMesa(numeroMesa);
    closeModal('modalPagamento');
    closeModal('modalPagamentoParcial');
    showAlert('Pedido finalizado com sucesso! O recibo foi gerado.');
    
    console.log('Abrindo recibo em nova aba');
    window.open('recibo.html', '_blank');
    
    console.log(`Pedido finalizado para mesa ${numeroMesa}`);
    renderTabs();
}

export function calcularTroco(valorPago, totalCompra) {
    const troco = valorPago - totalCompra;
    return troco > 0 ? troco : 0;
}

export function validarPagamento(valor, total) {
    return valor >= total;
}

export function gerarCodigoPix() {
    return 'PIX' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export function processarPagamentoCartao(numeroCartao, validade, cvv, valor) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (numeroCartao && validade && cvv && valor > 0) {
                resolve('Pagamento aprovado');
            } else {
                reject('Dados do cartão inválidos');
            }
        }, 2000);
    });
}

export function calcularDesconto(total, percentualDesconto) {
    return total * (percentualDesconto / 100);
}

export function aplicarDesconto(total, valorDesconto) {
    return Math.max(total - valorDesconto, 0);
}

export function dividirConta(total, numeroPessoas) {
    return total / numeroPessoas;
}

export function verificarPagamentoPendente(numeroMesa) {
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em verificarPagamentoPendente`);
        return false;
    }
    const totalPendente = calcularTotal(mesa.carrinho) - mesa.totalAbatido;
    return totalPendente > 0;
}

export function getTotalPendente(numeroMesa) {
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em getTotalPendente`);
        return 0;
    }
    return calcularTotal(mesa.carrinho) - mesa.totalAbatido;
}

export function atualizarResumoPayment(numeroMesa) {
    const resumoPayment = document.getElementById('resumoPayment');
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        console.error(`Erro: Mesa ${numeroMesa} não encontrada em atualizarResumoPayment`);
        resumoPayment.innerHTML = '<p>Erro: Mesa não encontrada.</p>';
        return;
    }

    const total = calcularTotal(mesa.carrinho);
    const totalPendente = total - mesa.totalAbatido;

    resumoPayment.innerHTML = `
        <h3>Resumo do Pagamento</h3>
        <p>Total da Conta: R$ ${formatarMoeda(total)}</p>
        <p>Total Abatido: R$ ${formatarMoeda(mesa.totalAbatido)}</p>
        <p>Total Pendente: R$ ${formatarMoeda(totalPendente)}</p>
    `;
}