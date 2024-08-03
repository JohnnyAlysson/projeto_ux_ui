document.addEventListener('DOMContentLoaded', () => {
  const receiptItems = document.getElementById('receipt-items');
  const receiptTotal = document.getElementById('receipt-total');
  const receiptDate = document.getElementById('receipt-date');
  const receiptPaymentMethod = document.getElementById('receipt-payment-method');
  const receiptChange = document.getElementById('receipt-change');

  const lastOrder = JSON.parse(localStorage.getItem('lastOrder')) || {};

  const calculateTotal = () => {
      const total = lastOrder.cart.reduce((acc, item) => acc + item.price, 0);
      receiptTotal.textContent = `Total: R$${total.toFixed(2)}`;
  };

  const renderReceipt = () => {
      lastOrder.cart.forEach(item => {
          const listItem = document.createElement('li');
          listItem.textContent = `${item.name} - R$${item.price.toFixed(2)}`;
          receiptItems.appendChild(listItem);
      });
      calculateTotal();
      receiptDate.textContent = `Data: ${lastOrder.date}`;
      receiptPaymentMethod.textContent = `Método de Pagamento: ${lastOrder.paymentMethod}`;
      if (lastOrder.paymentMethod === 'cash') {
          receiptChange.textContent = `Troco: R$${lastOrder.change.toFixed(2)}`;
      }
  };

  renderReceipt();
});