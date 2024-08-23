// pagamento.js
import { getMesa, limparMesa, renderTabs } from './mesa.js';
import { calcularTotal, formatarMoeda } from './utils.js';
import { adicionarVendaAoHistorico } from './historico.js';
import { showAlert, closeModal, updateTotalDisplay, openModal } from './ui.js';

export function abrirModalFinalizarPedido(numeroMesa) {
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        showAlert(`Erro: Mesa ${numeroMesa} não encontrada.`);
        return;
    }

    const total = calcularTotal(mesa.carrinho);
    const totalPendente = total - mesa.totalAbatido;

    const resumoPedido = document.getElementById('resumoPedido');
    resumoPedido.innerHTML = `
        <p>Total da Conta: R$ ${formatarMoeda(total)}</p>
        <p>Total Abatido: R$ ${formatarMoeda(mesa.totalAbatido)}</p>
        <p>Total Pendente: R$ ${formatarMoeda(totalPendente)}</p>
    `;

    const formFinalizarPedido = document.getElementById('formFinalizarPedido');
    formFinalizarPedido.onsubmit = (e) => processarPagamento(e, numeroMesa);

    openModal('modalFinalizarPedido');
}

function processarPagamento(e, numeroMesa) {
    e.preventDefault();
    const mesa = getMesa(numeroMesa);
    const valorPagamento = parseFloat(document.getElementById('valorPagamento').value);
    const metodoPagamento = document.getElementById('metodoPagamento').value;
    const incluirServico = document.getElementById('incluirServico').checked;
    const observacoes = document.getElementById('observacoes').value;

    const total = calcularTotal(mesa.carrinho);
    const totalPendente = total - mesa.totalAbatido;
    let valorFinal = valorPagamento;

    if (incluirServico) {
        valorFinal *= 1.1; // Add 10% service charge
    }

    if (valorFinal > totalPendente) {
        showAlert('O valor do pagamento não pode ser maior que o valor pendente.');
        return;
    }

    mesa.totalAbatido += valorFinal;
    mesa.pagamentosParciais.push({
        valor: valorFinal,
        metodo: metodoPagamento,
        data: new Date().toISOString()
    });

    if (mesa.totalAbatido >= total) {
        finalizarPedido(numeroMesa, metodoPagamento, observacoes);
    } else {
        showAlert(`Pagamento parcial de R$ ${formatarMoeda(valorFinal)} realizado com sucesso.`);
        closeModal('modalFinalizarPedido');
        renderTabs();
    }
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
        metodoPagamento,
        observacoes,
        carrinho: mesa.carrinho,
        pagamentosParciais: mesa.pagamentosParciais
    });

    console.log('Limpando mesa');
    limparMesa(numeroMesa);
    closeModal('modalFinalizarPedido');
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