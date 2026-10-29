const MOEDAS_SUPORTADAS = ['BRL', 'USD', 'EUR', 'GBP'];
const API_BASE_URL = 'https://api.frankfurter.dev/v2';

function erroCotacao(tipo, message) {
  const erro = new Error(message);
  erro.tipo = tipo;
  return erro;
}

function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const timestamp = Date.parse(`${data}T00:00:00Z`);
  return Number.isFinite(timestamp)
    && new Date(timestamp).toISOString().slice(0, 10) === data;
}

async function buscarCotacao(origem, destino, requisitar = fetch) {
  if (
    !MOEDAS_SUPORTADAS.includes(origem)
    || !MOEDAS_SUPORTADAS.includes(destino)
  ) {
    throw erroCotacao('moeda-nao-suportada', 'Moeda não suportada.');
  }

  if (origem === destino) {
    return { base: origem, quote: destino, rate: 1, date: null };
  }

  let resposta;
  try {
    resposta = await requisitar(
      `${API_BASE_URL}/rate/${origem}/${destino}`,
      { headers: { Accept: 'application/json' } }
    );
  } catch {
    throw erroCotacao('conexao', 'Verifique sua conexão e tente novamente.');
  }

  if (!resposta.ok) {
    throw erroCotacao(
      'api',
      resposta.status === 404 || resposta.status === 422
        ? 'A API não encontrou uma cotação para esse par de moedas.'
        : 'A API de cotação está indisponível. Tente novamente mais tarde.'
    );
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    throw erroCotacao('resposta-invalida', 'A API retornou uma resposta inválida.');
  }

  if (
    !dados
    || typeof dados !== 'object'
    || dados.base !== origem
    || dados.quote !== destino
    || typeof dados.rate !== 'number'
    || !Number.isFinite(dados.rate)
    || dados.rate <= 0
  ) {
    throw erroCotacao('resposta-invalida', 'A API retornou uma resposta inválida.');
  }

  return {
    base: dados.base,
    quote: dados.quote,
    rate: dados.rate,
    date: dataValida(dados.date) ? dados.date : null,
  };
}

module.exports = {
  MOEDAS_SUPORTADAS,
  buscarCotacao,
};
