// Paleta oficial do toDuro
export const colors = {
  midnight: '#0B1220', // fundo principal
  mint: '#20D6A0', // ações e destaques
  navy: '#101C2D', // cards e campos
  steel: '#344762', // bordas e divisores
  cloud: '#F4F7FB', // textos principais
  muted: '#8FA5C4', // textos secundários
  mintSoft: '#20D6A022', // variação de intensidade do mint
  mintMid: '#20D6A055',
};

export const formatBRL = (valor) => {
  const [int, dec] = Math.abs(valor).toFixed(2).split('.');
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${valor < 0 ? '-' : ''}R$ ${milhar},${dec}`;
};

// "1.234,56" ou "1234.56" -> número
export const parseValor = (texto) => {
  if (!texto) return NaN;
  let t = String(texto).trim().replace(/[^\d.,]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  return parseFloat(t);
};

// "dd/mm/aaaa" válido?
export const dataValida = (texto) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || '');
  if (!m) return false;
  const [, d, mes, a] = m.map(Number);
  const dt = new Date(a, mes - 1, d);
  return dt.getFullYear() === a && dt.getMonth() === mes - 1 && dt.getDate() === d;
};

export const chaveData = (texto) => {
  const [d, m, a] = texto.split('/');
  return `${a}${m}${d}`;
};

export const hojeBR = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
export const CATEGORIAS_DESPESA = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros',
];
