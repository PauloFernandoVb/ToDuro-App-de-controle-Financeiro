function dataValida(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || '');
  if (!partes) return false;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano
    && data.getMonth() === mes - 1
    && data.getDate() === dia;
}

function transacaoValida(transacao) {
  return transacao
    && (transacao.tipo === 'receita' || transacao.tipo === 'despesa')
    && typeof transacao.descricao === 'string'
    && Boolean(transacao.descricao.trim())
    && typeof transacao.valor === 'number'
    && Number.isFinite(transacao.valor)
    && transacao.valor > 0
    && typeof transacao.categoria === 'string'
    && Boolean(transacao.categoria.trim())
    && typeof transacao.data === 'string'
    && dataValida(transacao.data)
    && (transacao.obs === undefined || typeof transacao.obs === 'string');
}

function normalizarTransacoes(dados) {
  if (dados === null || dados === undefined) return [];

  if (typeof dados !== 'object' || Array.isArray(dados)) {
    throw new Error('Formato inválido de movimentações.');
  }

  return Object.entries(dados).map(([id, transacao]) => {
    if (!transacaoValida(transacao)) {
      throw new Error(`Movimentação inválida: ${id}`);
    }

    return {
      ...transacao,
      obs: transacao.obs ?? '',
      id,
    };
  });
}

function calcularTotais(transacoes) {
  const receitas = transacoes
    .filter((transacao) => transacao.tipo === 'receita')
    .reduce((soma, transacao) => soma + transacao.valor, 0);
  const despesas = transacoes
    .filter((transacao) => transacao.tipo === 'despesa')
    .reduce((soma, transacao) => soma + transacao.valor, 0);

  return { receitas, despesas, saldo: receitas - despesas };
}

function formatarValorMonetario(valor) {
  const digitos = String(valor ?? '').replace(/\D/g, '').slice(0, 15);
  if (!digitos) return '';

  const centavos = digitos.slice(-2).padStart(2, '0');
  const inteiro = (digitos.slice(0, -2).replace(/^0+(?=\d)/, '') || '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiro},${centavos}`;
}

function chaveData(texto) {
  const [dia, mes, ano] = texto.split('/');
  return `${ano}${mes}${dia}`;
}

function ordenarTransacoes(transacoes) {
  return [...transacoes].sort(
    (a, b) => chaveData(b.data).localeCompare(chaveData(a.data))
      || String(b.id).localeCompare(String(a.id))
  );
}

function caminhoTransacoesDoUsuario(uid, id) {
  if (typeof uid !== 'string' || !uid.trim()) {
    const erro = new Error('É necessário entrar na conta para acessar as movimentações.');
    erro.code = 'auth/no-current-user';
    throw erro;
  }

  const caminho = `usuarios/${uid}/transacoes`;
  return id === undefined ? caminho : `${caminho}/${String(id)}`;
}

module.exports = {
  calcularTotais,
  caminhoTransacoesDoUsuario,
  chaveData,
  dataValida,
  formatarValorMonetario,
  normalizarTransacoes,
  ordenarTransacoes,
};
