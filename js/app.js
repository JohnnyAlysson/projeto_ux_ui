import { produtos, getProdutosPorCategoria, getAllCategorias } from './products.js';
import { renderSalesChart } from './sales-chart.js';


document.addEventListener('DOMContentLoaded', () => {
    const mesasGrid = document.getElementById('mesasGrid');
    const carrinhoItems = document.getElementById('carrinhoItems');
    const totalValue = document.getElementById('totalValue');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const adicionarProdutoBtn = document.getElementById('adicionarProdutoBtn');
    const finalizarPedidoBtn = document.getElementById('finalizarPedidoBtn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementsByClassName('close')[0];
    const reportBtn = document.querySelector('.nav-btn:nth-child(2)');

    let mesas = [];
    let mesaAtual = null;
    let vendas = [];

    function inicializarMesas() {
        for (let i = 1; i <= 10; i++) {
            mesas.push({
                numero: i,
                status: 'Livre',
                pedidos: []
            });
        }
    }

    function renderMesas() {
        mesasGrid.innerHTML = '';
        mesas.forEach(mesa => {
            const mesaCard = document.createElement('div');
            mesaCard.className = 'mesa-card';
            mesaCard.innerHTML = `
                <div class="mesa-numero">Mesa ${mesa.numero}</div>
                <div class="mesa-status">${mesa.status}</div>
            `;
            mesaCard.addEventListener('click', () => selecionarMesa(mesa));
            mesasGrid.appendChild(mesaCard);
        });
    }

    function selecionarMesa(mesa) {
        mesaAtual = mesa;
        if (mesa.status === 'Livre') {
            mesa.status = 'Ocupada';
        }
        atualizarCarrinho();
        renderMesas();
    }

    function atualizarCarrinho() {
        if (!mesaAtual) {
            carrinhoItems.innerHTML = '<p>Nenhuma mesa selecionada</p>';
            totalValue.textContent = 'R$ 0.00';
            return;
        }

        carrinhoItems.innerHTML = '';
        let total = 0;
        mesaAtual.pedidos.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrinho-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <div>${item.nome}</div>
                    <div>R$ ${item.preco.toFixed(2)}</div>
                </div>
                <div class="item-quantidade">
                    <button class="quantidade-btn menos">-</button>
                    <span>${item.quantidade}</span>
                    <button class="quantidade-btn mais">+</button>
                </div>
            `;
            itemElement.querySelector('.menos').addEventListener('click', () => alterarQuantidade(item.id, -1));
            itemElement.querySelector('.mais').addEventListener('click', () => alterarQuantidade(item.id, 1));
            carrinhoItems.appendChild(itemElement);
            total += item.preco * item.quantidade;
        });
        totalValue.textContent = `R$ ${total.toFixed(2)}`;
    }

    function alterarQuantidade(id, delta) {
        const index = mesaAtual.pedidos.findIndex(item => item.id === id);
        if (index !== -1) {
            mesaAtual.pedidos[index].quantidade += delta;
            if (mesaAtual.pedidos[index].quantidade <= 0) {
                mesaAtual.pedidos.splice(index, 1);
            }
            atualizarCarrinho();
        }
    }

    function mostrarProdutos() {
        if (!mesaAtual) {
            alert('Por favor, selecione uma mesa primeiro.');
            return;
        }
        modalTitle.textContent = 'Adicionar Produto';
        modalContent.innerHTML = '';

        const categorias = getAllCategorias();
        const categoriasContainer = document.createElement('div');
        categoriasContainer.className = 'categorias-container';
        categorias.forEach(categoria => {
            const categoriaBtn = document.createElement('button');
            categoriaBtn.textContent = categoria;
            categoriaBtn.addEventListener('click', () => renderProdutosPorCategoria(categoria));
            categoriasContainer.appendChild(categoriaBtn);
        });
        modalContent.appendChild(categoriasContainer);

        const produtosContainer = document.createElement('div');
        produtosContainer.id = 'produtosContainer';
        produtosContainer.className = 'produtos-container';
        modalContent.appendChild(produtosContainer);

        renderProdutosPorCategoria(categorias[0]);
        modal.style.display = 'block';
    }

    function renderProdutosPorCategoria(categoria) {
        const produtosContainer = document.getElementById('produtosContainer');
        produtosContainer.innerHTML = '';
        const produtosFiltrados = getProdutosPorCategoria(categoria);
        produtosFiltrados.forEach(produto => {
            const produtoElement = document.createElement('div');
            produtoElement.className = 'produto-item';
            produtoElement.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2)}</p>
                <button class="adicionar-produto">Adicionar</button>
            `;
            produtoElement.querySelector('.adicionar-produto').addEventListener('click', () => adicionarProduto(produto));
            produtosContainer.appendChild(produtoElement);
        });
    }

    function adicionarProduto(produto) {
        const index = mesaAtual.pedidos.findIndex(item => item.id === produto.id);
        if (index !== -1) {
            mesaAtual.pedidos[index].quantidade++;
        } else {
            mesaAtual.pedidos.push({ ...produto, quantidade: 1 });
        }
        atualizarCarrinho();
        // Removida a linha que fechava o modal
    }

    function mostrarModalPagamento() {
        modalTitle.textContent = 'Finalizar Pedido';
        const total = mesaAtual.pedidos.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
        modalContent.innerHTML = `
            <form id="formPagamento">
                <div>
                    <label for="metodoPagamento">Método de Pagamento:</label>
                    <select id="metodoPagamento" required>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">PIX</option>
                    </select>
                </div>
                <div>
                    <label for="valorPago">Valor Pago:</label>
                    <input type="number" id="valorPago" step="0.01" min="${total.toFixed(2)}" value="${total.toFixed(2)}" required>
                </div>
                <div>
                    <p>Total a pagar: R$ ${total.toFixed(2)}</p>
                </div>
                <button type="submit">Confirmar Pagamento</button>
            </form>
        `;
        modal.style.display = 'block';

        document.getElementById('formPagamento').addEventListener('submit', (e) => {
            e.preventDefault();
            const metodoPagamento = document.getElementById('metodoPagamento').value;
            const valorPago = parseFloat(document.getElementById('valorPago').value);
            processarPagamento(metodoPagamento, valorPago);
        });
    }

    function processarPagamento(metodoPagamento, valorPago) {
        const total = mesaAtual.pedidos.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
        if (valorPago < total) {
            alert('Valor pago é insuficiente.');
            return;
        }
        const troco = valorPago - total;
        gerarRecibo(metodoPagamento, valorPago, troco);
        
        // Adicionar venda ao relatório
        vendas.push({
            data: new Date(),
            mesa: mesaAtual.numero,
            itens: mesaAtual.pedidos,
            total: total,
            metodoPagamento: metodoPagamento
        });
        
        mesaAtual.status = 'Livre';
        mesaAtual.pedidos = [];
        mesaAtual = null;
        renderMesas();
        atualizarCarrinho();
        modal.style.display = 'none';
    }

    function gerarRecibo(metodoPagamento, valorPago, troco) {
        const total = mesaAtual.pedidos.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
        const recibo = `
            <div class="recibo">
                <h2>Café Serenidade</h2>
                <p>Mesa ${mesaAtual.numero} - ${new Date().toLocaleString()}</p>
                <ul>
                    ${mesaAtual.pedidos.map(item => `
                        <li>${item.nome} x${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}</li>
                    `).join('')}
                </ul>
                <p class="total">Total: R$ ${total.toFixed(2)}</p>
                <div class="pagamento-info">
                    <p>Método de Pagamento: ${metodoPagamento}</p>
                    <p>Valor Pago: R$ ${valorPago.toFixed(2)}</p>
                    <p>Troco: R$ ${troco.toFixed(2)}</p>
                </div>
                <p>Obrigado pela preferência!</p>
            </div>
        `;
        
        const reciboWindow = window.open('', '_blank');
        reciboWindow.document.write(`
            <html>
                <head>
                    <title>Recibo - Café Serenidade</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                        }
                        .recibo {
                            max-width: 300px;
                            margin: 0 auto;
                            border: 1px solid #ccc;
                            padding: 20px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        h2 {
                            text-align: center;
                            border-bottom: 2px dashed #000;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }
                        ul {
                            list-style-type: none;
                            padding: 0;
                        }
                        li {
                            margin-bottom: 5px;
                        }
                        .total {
                            font-weight: bold;
                            border-top: 1px solid #000;
                            margin-top: 10px;
                            padding-top: 10px;
                        }
                        .pagamento-info {
                            margin-top: 20px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    ${recibo}
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        reciboWindow.document.close();
    }

    function finalizarPedido() {
        if (!mesaAtual) {
            alert('Por favor, selecione uma mesa primeiro.');
            return;
        }
        if (mesaAtual.pedidos.length === 0) {
            alert('O carrinho está vazio.');
            return;
        }
        mostrarModalPagamento();
    }

    function buscarMesas() {
        const termo = searchInput.value.toLowerCase();
        const mesasFiltradas = mesas.filter(mesa => 
            mesa.numero.toString().includes(termo) || 
            mesa.status.toLowerCase().includes(termo)
        );
        renderMesasFiltradas(mesasFiltradas);
    }

    function renderMesasFiltradas(mesasFiltradas) {
        mesasGrid.innerHTML = '';
        mesasFiltradas.forEach(mesa => {
            const mesaCard = document.createElement('div');
            mesaCard.className = 'mesa-card';
            mesaCard.innerHTML = `
                <div class="mesa-numero">Mesa ${mesa.numero}</div>
                <div class="mesa-status">${mesa.status}</div>
            `;
            mesaCard.addEventListener('click', () => selecionarMesa(mesa));
            mesasGrid.appendChild(mesaCard);
        });
    }

    function gerarRelatorio() {
        console.log('Iniciando geração de relatório');
        modalTitle.textContent = 'Relatório de Vendas';
        
        const filtroHTML = `
            <h3>Defina uma data para atualizar o gráfico abaixo</h3>
            <div class="filtro-relatorio">
                <label for="dataInicio">Data Início:</label>
                <input type="date" id="dataInicio">
                <label for="dataFim">Data Fim:</label>
                <input type="date" id="dataFim">
                <label for="formaPagamento">Forma de Pagamento:</label>
                <select id="formaPagamento">
                    <option value="">Todas</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                    <option value="pix">PIX</option>
                </select>
                <label for="mesa">Mesa:</label>
                <select id="mesa">
                    <option value="">Todas</option>
                    ${mesas.map(mesa => `<option value="${mesa.numero}">Mesa ${mesa.numero}</option>`).join('')}
                </select>
                <button id="aplicarFiltro">Aplicar Filtro</button>
            </div>
        `;
    
        modalContent.innerHTML = filtroHTML + '<div id="relatorioContent"></div><div id="graficoVendas"></div>';
        
        const aplicarFiltroBtn = document.getElementById('aplicarFiltro');
        if (aplicarFiltroBtn) {
            aplicarFiltroBtn.addEventListener('click', () => {
                const dataInicio = document.getElementById('dataInicio').value;
                const dataFim = document.getElementById('dataFim').value;
                const formaPagamento = document.getElementById('formaPagamento').value;
                const mesa = document.getElementById('mesa').value;
                
                console.log('Aplicando filtros:', { dataInicio, dataFim, formaPagamento, mesa });
                atualizarRelatorio(dataInicio, dataFim, formaPagamento, mesa);
            });
        } else {
            console.error('Botão de aplicar filtro não encontrado');
        }
    
        // Inicializar o relatório com todos os dados
        atualizarRelatorio();
    
        // Exibir o modal
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error('Modal não encontrado');
        }
    
        console.log('Relatório gerado e modal exibido');
    }

    function atualizarRelatorio(dataInicio = '', dataFim = '', formaPagamento = '', mesa = '') {
        let vendasFiltradas = vendas;
    
        if (dataInicio) {
            const dataInicioObj = new Date(dataInicio);
            vendasFiltradas = vendasFiltradas.filter(venda => new Date(venda.data) >= dataInicioObj);
        }
        if (dataFim) {
            const dataFimObj = new Date(dataFim);
            dataFimObj.setHours(23, 59, 59, 999); // Set to end of day
            vendasFiltradas = vendasFiltradas.filter(venda => new Date(venda.data) <= dataFimObj);
        }
        if (formaPagamento) {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.metodoPagamento === formaPagamento);
        }
        if (mesa) {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.mesa === parseInt(mesa));
        }
    
        const totalVendas = vendasFiltradas.reduce((sum, venda) => sum + venda.total, 0);
        const vendasPorMetodo = vendasFiltradas.reduce((acc, venda) => {
            acc[venda.metodoPagamento] = (acc[venda.metodoPagamento] || 0) + venda.total;
            return acc;
        }, {});
    
        const produtosMaisVendidos = calcularProdutosMaisVendidos(vendasFiltradas);
    
        const relatorioContent = document.getElementById('relatorioContent');
        relatorioContent.innerHTML = `
            <h3>Total de Vendas: R$ ${totalVendas.toFixed(2)}</h3>
            <h4>Vendas por Método de Pagamento:</h4>
            <ul>
                ${Object.entries(vendasPorMetodo).map(([metodo, total]) => `
                    <li>${metodo}: R$ ${total.toFixed(2)}</li>
                `).join('')}
            </ul>
            <h4>Produtos em Destaque:</h4>
            <ul>
                ${produtosMaisVendidos.map(produto => `
                    <li>${produto.nome}: ${produto.quantidade} unidades</li>
                `).join('')}
            </ul>
            <h4>Últimas Vendas:</h4>
            <ul>
                ${vendasFiltradas.slice(-5).map(venda => `
                    <li>
                        Mesa ${venda.mesa} - ${new Date(venda.data).toLocaleString()} - R$ ${venda.total.toFixed(2)}
                    </li>
                `).join('')}
            </ul>
        `;
    
        const graficoContainer = document.getElementById('graficoVendas');
        graficoContainer.innerHTML = '';
        const grafico = renderSalesChart(vendasFiltradas, dataInicio, dataFim);
        graficoContainer.appendChild(grafico);
    }
    
    function calcularProdutosMaisVendidos(vendasFiltradas) {
        const produtosVendidos = {};
        vendasFiltradas.forEach(venda => {
            venda.itens.forEach(item => {
                if (produtosVendidos[item.id]) {
                    produtosVendidos[item.id].quantidade += item.quantidade;
                } else {
                    produtosVendidos[item.id] = {
                        id: item.id,
                        nome: item.nome,
                        quantidade: item.quantidade
                    };
                }
            });
        });
    
        return Object.values(produtosVendidos)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 3);
    }

    adicionarProdutoBtn.addEventListener('click', mostrarProdutos);
    finalizarPedidoBtn.addEventListener('click', finalizarPedido);
    searchBtn.addEventListener('click', buscarMesas);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            buscarMesas();
        }
    });
    reportBtn.addEventListener('click', gerarRelatorio);

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    inicializarMesas();
    renderMesas();
});