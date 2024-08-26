// utils.js

export function calcularTotal(carrinho) {
  return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

export function formatarMoeda(valor) {
  return valor.toFixed(2);
}