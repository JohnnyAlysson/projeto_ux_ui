// relatorio-export.js

// Função para exportar o relatório como PDF
export function exportarRelatorioPDF(vendas, filtros) {
  const vendasFiltradas = obterVendasFiltradas(vendas, filtros);
  
  // Criamos um elemento temporário para renderizar o conteúdo do PDF
  const element = document.createElement('div');
  element.innerHTML = `
      <h2>Relatório de Vendas - Café Serenidade</h2>
      <p>Período: ${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}</p>
      <p>Forma de Pagamento: ${filtros.formaPagamento || 'Todas'}</p>
      <p>Mesa: ${filtros.mesa || 'Todas'}</p>
      <table>
          <thead>
              <tr>
                  <th>Data</th>
                  <th>Mesa</th>
                  <th>Total</th>
                  <th>Método de Pagamento</th>
              </tr>
          </thead>
          <tbody>
              ${vendasFiltradas.map(venda => `
                  <tr>
                      <td>${new Date(venda.data).toLocaleDateString()}</td>
                      <td>${venda.mesa}</td>
                      <td>R$ ${venda.total.toFixed(2)}</td>
                      <td>${venda.metodoPagamento}</td>
                  </tr>
              `).join('')}
          </tbody>
      </table>
  `;

  // Utilizamos a biblioteca html2pdf.js
  html2pdf().from(element).save('relatorio-cafe-serenidade.pdf');
}

// Função para exportar o relatório como JSON
export function exportarRelatorioJSON(vendas, filtros) {
  const vendasFiltradas = obterVendasFiltradas(vendas, filtros);
  
  const relatorioJSON = {
      periodoInicio: filtros.dataInicio || 'Não especificado',
      periodoFim: filtros.dataFim || 'Não especificado',
      formaPagamento: filtros.formaPagamento || 'Todas',
      mesa: filtros.mesa || 'Todas',
      vendas: vendasFiltradas.map(venda => ({
          data: venda.data,
          mesa: venda.mesa,
          total: venda.total,
          metodoPagamento: venda.metodoPagamento,
          itens: venda.itens // Assumindo que cada venda tem um array de itens
      }))
  };

  const dadosJSON = JSON.stringify(relatorioJSON, null, 2);
  const blob = new Blob([dadosJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio-cafe-serenidade.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Função auxiliar para obter as vendas filtradas
export function obterVendasFiltradas(vendas, filtros) {
  return vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      
      if (filtros.dataInicio && dataVenda < new Date(filtros.dataInicio)) return false;
      
      if (filtros.dataFim) {
          const dataFim = new Date(filtros.dataFim);
          dataFim.setHours(23, 59, 59, 999);
          if (dataVenda > dataFim) return false;
      }
      
      if (filtros.formaPagamento && venda.metodoPagamento !== filtros.formaPagamento) return false;
      
      if (filtros.mesa && venda.mesa !== parseInt(filtros.mesa)) return false;
      
      return true;
  });
}

// Função para adicionar botões de exportação ao relatório
export function adicionarBotoesExportacao(vendas) {
  console.log("Iniciando adicionarBotoesExportacao");

  const botoesContainer = document.createElement('div');
  botoesContainer.className = 'botoes-exportacao';
  botoesContainer.style.margin = '10px 0';

  const botaoPDF = document.createElement('button');
  botaoPDF.textContent = 'Exportar PDF';
  botaoPDF.style.marginRight = '10px';
  botaoPDF.onclick = () => {
      console.log("Clique no botão PDF");
      const filtros = obterFiltrosAtuais();
      exportarRelatorioPDF(vendas, filtros);
  };

  const botaoJSON = document.createElement('button');
  botaoJSON.textContent = 'Exportar JSON';
  botaoJSON.onclick = () => {
      console.log("Clique no botão JSON");
      const filtros = obterFiltrosAtuais();
      exportarRelatorioJSON(vendas, filtros);
  };

  botoesContainer.appendChild(botaoPDF);
  botoesContainer.appendChild(botaoJSON);

  const relatorioContent = document.getElementById('relatorioContent');
  if (relatorioContent) {
      relatorioContent.appendChild(botoesContainer);
      console.log("Botões anexados ao relatorioContent");
  } else {
      console.error("Elemento 'relatorioContent' não encontrado");
      document.body.appendChild(botoesContainer);
      console.log("Botões anexados ao body como fallback");
  }

  console.log("adicionarBotoesExportacao concluído");
  return botoesContainer;
}

function obterFiltrosAtuais() {
  const filtros = {
      dataInicio: document.getElementById('dataInicio')?.value,
      dataFim: document.getElementById('dataFim')?.value,
      formaPagamento: document.getElementById('formaPagamento')?.value,
      mesa: document.getElementById('mesa')?.value
  };
  console.log("Filtros atuais:", filtros);
  return filtros;
}