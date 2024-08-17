// historico.js
import { showAlert } from './ui.js';

let historicoVendas = [];

export function loadHistoricoVendas() {
    return fetch('data/sales_history.json')
        .then(response => response.json())
        .then(data => {
            historicoVendas = data;
            return historicoVendas;
        })
        .catch(error => {
            console.error('Erro ao carregar histórico de vendas:', error);
            showAlert('Não foi possível carregar o histórico de vendas.');
        });
}

export function getHistoricoVendas() {
    return historicoVendas;
}

export function adicionarVendaAoHistorico(venda) {
    historicoVendas.push(venda);
    salvarHistoricoVendas();
}

export function renderHistoricoVendas() {
    const historicoVendasDiv = document.getElementById('historicoVendas');
    historicoVendasDiv.innerHTML = '<h3>Histórico de Vendas</h3>';
    if (historicoVendas.length === 0) {
        historicoVendasDiv.innerHTML += '<p>Nenhuma venda registrada.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Mesa</th>
                <th>Total</th>
                <th>Método de Pagamento</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    historicoVendas.forEach(venda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${venda.data}</td>
            <td>${venda.numeroMesa}</td>
            <td>R$ ${venda.total.toFixed(2)}</td>
            <td>${venda.metodoPagamento}</td>
        `;
        tbody.appendChild(tr);
    });

    historicoVendasDiv.appendChild(table);
}

function salvarHistoricoVendas() {
    // Em uma aplicação real, isso enviaria os dados para um servidor
    // Para este exemplo, vamos apenas simular salvando no localStorage
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
}

export function filtrarHistoricoPorData(dataInicio, dataFim) {
    return historicoVendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= dataInicio && dataVenda <= dataFim;
    });
}

export function calcularTotalVendas() {
    return historicoVendas.reduce((total, venda) => total + venda.total, 0);
}

export function calcularTotalVendasPorMetodo(metodoPagamento) {
    return historicoVendas
        .filter(venda => venda.metodoPagamento === metodoPagamento)
        .reduce((total, venda) => total + venda.total, 0);
}

export function obterVendasPorMesa(numeroMesa) {
    return historicoVendas.filter(venda => venda.numeroMesa === numeroMesa);
}

export function obterVendasPorPeriodo(periodoInicio, periodoFim) {
    return historicoVendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= periodoInicio && dataVenda <= periodoFim;
    });
}

export function calcularMediaVendasDiarias(periodoInicio, periodoFim) {
    const vendasNoPeriodo = obterVendasPorPeriodo(periodoInicio, periodoFim);
    const totalVendas = vendasNoPeriodo.reduce((total, venda) => total + venda.total, 0);
    const diasNoPeriodo = (periodoFim - periodoInicio) / (1000 * 60 * 60 * 24) + 1;
    return totalVendas / diasNoPeriodo;
}

export function obterTopProdutosVendidos(limite = 5) {
    const produtosVendidos = {};
    historicoVendas.forEach(venda => {
        venda.carrinho.forEach(item => {
            if (produtosVendidos[item.nome]) {
                produtosVendidos[item.nome] += item.quantidade;
            } else {
                produtosVendidos[item.nome] = item.quantidade;
            }
        });
    });

    return Object.entries(produtosVendidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([nome, quantidade]) => ({ nome, quantidade }));
}

export function exportarHistoricoCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Mesa,Total,Método de Pagamento\n";
    
    historicoVendas.forEach(venda => {
        csvContent += `${venda.data},${venda.numeroMesa},${venda.total},${venda.metodoPagamento}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_vendas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}