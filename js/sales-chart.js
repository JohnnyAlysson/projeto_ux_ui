// sales-chart.js

// import Chart from 'chart.js/auto';

export function renderSalesChart(vendas, dataInicio, dataFim) {
    const dadosFormatados = formatarDadosParaGrafico(vendas, dataInicio, dataFim);

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dadosFormatados.map(d => d.data),
            datasets: [{
                label: 'Vendas',
                data: dadosFormatados.map(d => d.vendas),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    return canvas;
}

function formatarDadosParaGrafico(vendas, dataInicio, dataFim) {
    const dadosPorDia = {};
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        const dataFormatada = d.toISOString().split('T')[0];
        dadosPorDia[dataFormatada] = 0;
    }

    vendas.forEach(venda => {
        const dataVenda = new Date(venda.data);
        if (dataVenda >= inicio && dataVenda <= fim) {
            const dataFormatada = dataVenda.toISOString().split('T')[0];
            dadosPorDia[dataFormatada] += venda.total;
        }
    });

    return Object.entries(dadosPorDia).map(([data, vendas]) => ({ data, vendas }));
}