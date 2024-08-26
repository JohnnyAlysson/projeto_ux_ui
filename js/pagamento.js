// pagamento.js
import { getMesa, limparMesa, renderTabs } from './mesa.js';
import { calcularTotal, formatarMoeda } from './utils.js';
import { adicionarVendaAoHistorico } from './historico.js';
import { showAlert, closeModal, openModal } from './ui.js';

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
    const observacoes = document.getElementById('observacoes').value;

    const total = calcularTotal(mesa.carrinho);
    const totalPendente = total - mesa.totalAbatido;

    if (valorPagamento > totalPendente) {
        showAlert('O valor do pagamento não pode ser maior que o valor pendente.');
        return;
    }

    mesa.totalAbatido += valorPagamento;
    mesa.pagamentosParciais.push({
        valor: valorPagamento,
        metodo: metodoPagamento,
        data: new Date().toISOString()
    });

    if (mesa.totalAbatido >= total) {
        finalizarPedido(numeroMesa, metodoPagamento, observacoes);
    } else {
        showAlert(`Pagamento parcial de R$ ${formatarMoeda(valorPagamento)} realizado com sucesso.`);
        closeModal('modalFinalizarPedido');
        renderTabs();
    }
}

export function finalizarPedido(numeroMesa, metodoPagamento = 'N/A', observacoes = '') {
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
        showAlert(`Erro: Mesa ${numeroMesa} não encontrada. Por favor, abra a mesa novamente.`);
        return;
    }
    
    const total = parseFloat(calcularTotal(mesa.carrinho));
    
    const dadosRecibo = {
        numeroMesa,
        metodoPagamento,
        observacoes,
        carrinho: mesa.carrinho,
        total: total,
        pagamentosParciais: mesa.pagamentosParciais,
        totalAbatido: mesa.totalAbatido
    };
    
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

    limparMesa(numeroMesa);
    closeModal('modalFinalizarPedido');
    showAlert('Pedido finalizado com sucesso! O recibo foi gerado.');
    
    window.open('recibo.html', '_blank');
    
    renderTabs();
}

export function verificarPagamentoPendente(numeroMesa) {
    const mesa = getMesa(numeroMesa);
    if (!mesa) return false;
    const totalPendente = calcularTotal(mesa.carrinho) - mesa.totalAbatido;
    return totalPendente > 0;
}

export function getTotalPendente(numeroMesa) {
    const mesa = getMesa(numeroMesa);
    if (!mesa) return 0;
    return calcularTotal(mesa.carrinho) - mesa.totalAbatido;
}

export function atualizarResumoPayment(numeroMesa) {
    const resumoPayment = document.getElementById('resumoPayment');
    const mesa = getMesa(numeroMesa);
    if (!mesa) {
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