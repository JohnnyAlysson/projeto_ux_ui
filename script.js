document.addEventListener('DOMContentLoaded', () => {
  let produtos = [];
  let mesas = {};
  let mesaAtual = null;

  const mesaInput = document.getElementById('mesaInput');
  const abrirMesaBtn = document.getElementById('abrirMesaBtn');
  const tabsList = document.getElementById('tabsList');
  const tabsContent = document.getElementById('tabsContent');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const modalPagamento = document.getElementById('modalPagamento');
  const closeModalPagamento = document.getElementById('closeModalPagamento');
  const modalPagamentoParcial = document.getElementById('modalPagamentoParcial');
  const closeModalPagamentoParcial = document.getElementById('closeModalPagamentoParcial');
  const produtosContainer = document.getElementById('produtosContainer');
  const categoriaSelect = document.getElementById('categoriaSelect');
  const formPagamento = document.getElementById('formPagamento');
  const formPagamentoParcial = document.getElementById('formPagamentoParcial');
  const resumoPagamentoParcial = document.getElementById('resumoPagamentoParcial');
  const modalNovoProduto = document.getElementById('modalNovoProduto');
  const closeModalNovoProduto = document.getElementById('closeModalNovoProduto');
  const formNovoProduto = document.getElementById('formNovoProduto');

  // Carregar produtos do arquivo JSON
  fetch('produtos.json')
      .then(response => response.json())
      .then(data => {
          produtos = data;
          renderProdutos();
      })
      .catch(error => console.error('Erro ao carregar produtos:', error));

  abrirMesaBtn.addEventListener('click', () => {
      const numeroMesa = parseInt(mesaInput.value, 10);
      if (!isNaN(numeroMesa) && numeroMesa > 0 && numeroMesa <= 99) {
          abrirMesa(numeroMesa);
      } else {
          alert("Por favor, insira um número de mesa válido (1-99).");
      }
  });

  closeModal.addEventListener('click', () => fecharModal());
  closeModalPagamento.addEventListener('click', () => fecharModalPagamento());
  closeModalPagamentoParcial.addEventListener('click', () => fecharModalPagamentoParcial());
  closeModalNovoProduto.addEventListener('click', () => fecharModalNovoProduto());

  window.onclick = function(event) {
      if (event.target === modal) {
          fecharModal();
      }
      if (event.target === modalPagamento) {
          fecharModalPagamento();
      }
      if (event.target === modalPagamentoParcial) {
          fecharModalPagamentoParcial();
      }
      if (event.target === modalNovoProduto) {
          fecharModalNovoProduto();
      }
  }

  categoriaSelect.addEventListener('change', () => {
      const categoria = categoriaSelect.value;
      renderProdutos(categoria);
  });

  formPagamento.addEventListener('submit', (e) => {
      e.preventDefault();
      const metodoPagamento = document.getElementById('metodoPagamento').value;
      const observacoes = document.getElementById('observacoes').value;
      const incluirServico = document.getElementById('incluirServico').checked;
      finalizarPedido(mesaAtual, metodoPagamento, observacoes, incluirServico);
  });

  formPagamentoParcial.addEventListener('submit', (e) => {
      e.preventDefault();
      const valorPagamentoParcial = parseFloat(document.getElementById('valorPagamentoParcial').value);
      if (!isNaN(valorPagamentoParcial) && valorPagamentoParcial > 0) {
          abaterValorParcial(mesaAtual, valorPagamentoParcial);
      } else {
          alert("Por favor, insira um valor válido para o pagamento parcial.");
      }
  });

  formNovoProduto.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nomeProduto').value;
      const preco = parseFloat(document.getElementById('precoProduto').value);
      const descricao = document.getElementById('descricaoProduto').value;
      const categoria = document.getElementById('categoriaProduto').value;
      const imagemFile = document.getElementById('imagemProduto').files[0];

      if (imagemFile) {
          const reader = new FileReader();
          reader.onload = function(event) {
              const imagemPath = event.target.result;
              adicionarNovoProduto(nome, preco, descricao, categoria, imagemPath);
          };
          reader.readAsDataURL(imagemFile);
      } else {
          alert("Por favor, selecione uma imagem para o produto.");
      }
  });

  function abrirMesa(numeroMesa) {
      if (!mesas[numeroMesa]) {
          mesas[numeroMesa] = { carrinho: [], totalAbatido: 0, pagamentosParciais: [] };
      }
      mesaAtual = numeroMesa;
      renderTabs();
  }

  function fecharMesa(numeroMesa) {
      abrirModalPagamento(numeroMesa);
  }

  function abrirModalPagamentoParcial(numeroMesa) {
      mesaAtual = numeroMesa;
      renderResumoPagamentoParcial();
      modalPagamentoParcial.style.display = 'flex';
  }

  function adicionarAoCarrinho(produto, quantidade, numeroMesa) {
      const mesa = mesas[numeroMesa];
      const itemExistente = mesa.carrinho.find(item => item.id === produto.id);
      if (itemExistente) {
          itemExistente.quantidade += quantidade;
      } else {
          mesa.carrinho.push({ ...produto, quantidade: quantidade });
      }
      renderTabs();
  }

  function calcularTotal(carrinho) {
      return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0).toFixed(2);
  }

  function renderTabs() {
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
              verCatalogoBtn.addEventListener('click', () => abrirModal(mesaAtual));
              card.appendChild(verCatalogoBtn);

              const fecharMesaBtn = document.createElement('button');
              fecharMesaBtn.textContent = `Fechar Mesa ${numeroMesa}`;
              fecharMesaBtn.className = 'close-mesa-btn mt-4';
              fecharMesaBtn.addEventListener('click', () => fecharMesa(mesaAtual));
              card.appendChild(fecharMesaBtn);

              const pagamentoParcialBtn = document.createElement('button');
              pagamentoParcialBtn.textContent = 'Pagamento Parcial';
              pagamentoParcialBtn.className = 'pagamento-parcial-btn mt-4';
              pagamentoParcialBtn.addEventListener('click', () => abrirModalPagamentoParcial(mesaAtual));
              card.appendChild(pagamentoParcialBtn);

              tabsContent.appendChild(card);
          }
      });
  }

  function abrirModal(numeroMesa) {
      renderProdutos();
      modal.style.display = 'flex';
  }

  function fecharModal() {
      modal.style.display = 'none';
  }

  function abrirModalPagamento(numeroMesa) {
      mesaAtual = numeroMesa;
      modalPagamento.style.display = 'flex';
  }

  function fecharModalPagamento() {
      modalPagamento.style.display = 'none';
  }

  function fecharModalPagamentoParcial() {
      modalPagamentoParcial.style.display = 'none';
  }

  function fecharModalNovoProduto() {
      modalNovoProduto.style.display = 'none';
  }

  function renderProdutos(categoria = 'Todas') {
      produtosContainer.innerHTML = '';

      const produtosFiltrados = categoria === 'Todas' ? produtos : produtos.filter(produto => produto.categoria === categoria);

      produtosFiltrados.forEach(produto => {
          const card = document.createElement('div');
          card.className = 'card';

          const img = document.createElement('img');
          img.src = produto.imagem;
          img.alt = produto.nome;
          img.onerror = function() {
              this.src = '/assets/placeholder.jpg';
          };
          card.appendChild(img);

          const cardContent = document.createElement('div');
          cardContent.className = 'card-content';
          cardContent.innerHTML = `
              <h3>${produto.nome}</h3>
              <p>${produto.descricao}</p>
              <p class="font-bold">R$ ${produto.preco.toFixed(2)}</p>
          `;

          const quantidadeInput = document.createElement('input');
          quantidadeInput.type = 'number';
          quantidadeInput.value = 1;
          quantidadeInput.min = 1;
          quantidadeInput.className = 'quantidade-input';

          const addButton = document.createElement('button');
          addButton.textContent = 'Adicionar ao Carrinho';
          addButton.addEventListener('click', () => {
              const quantidade = parseInt(quantidadeInput.value);
              if (!isNaN(quantidade) && quantidade > 0) {
                  adicionarAoCarrinho(produto, quantidade, mesaAtual);
              }
          });
          cardContent.appendChild(quantidadeInput);
          cardContent.appendChild(addButton);

          card.appendChild(cardContent);
          produtosContainer.appendChild(card);
      });
  }

  function abaterValorParcial(numeroMesa, valor) {
      const mesa = mesas[numeroMesa];
      mesa.pagamentosParciais.push(valor);
      mesa.totalAbatido = (mesa.totalAbatido || 0) + valor;
      renderTabs();
      renderResumoPagamentoParcial();
      fecharModalPagamentoParcial();
  }

  function renderResumoPagamentoParcial() {
      const mesa = mesas[mesaAtual];
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

  function finalizarPedido(numeroMesa, metodoPagamento, observacoes, incluirServico) {
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
      fecharModalPagamento();
      delete mesas[numeroMesa];
      mesaAtual = null;
      renderTabs();
  }

  function adicionarNovoProduto(nome, preco, descricao, categoria, imagemPath) {
    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
    const novoProduto = {
        id: novoId,
        nome: nome,
        preco: preco,
        descricao: descricao,
        imagem: imagemPath,
        categoria: categoria
    };
    produtos.push(novoProduto);
    renderProdutos();
    fecharModalNovoProduto();
    alert('Produto adicionado com sucesso!');
}

// Adicionar botão para abrir o modal de novo produto
const btnNovoProduto = document.createElement('button');
btnNovoProduto.textContent = 'Adicionar Novo Produto';
btnNovoProduto.addEventListener('click', () => {
    modalNovoProduto.style.display = 'flex';
});
document.querySelector('.mesa-controls').appendChild(btnNovoProduto);

// Inicialização
renderTabs();
});