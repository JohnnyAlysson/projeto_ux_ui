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
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
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