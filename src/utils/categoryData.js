const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const CATEGORIAS_DESPESA = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros',
];

const CATEGORIAS_PADRAO = {
  receita: CATEGORIAS_RECEITA,
  despesa: CATEGORIAS_DESPESA,
};

function normalizarLista(lista, padrao) {
  if (!Array.isArray(lista) && (!lista || typeof lista !== 'object')) {
    return [...padrao];
  }

  const nomes = Array.isArray(lista) ? lista : Object.values(lista);
  const vistos = new Set();
  return nomes.reduce((resultado, nome) => {
    if (typeof nome !== 'string' || !nome.trim()) return resultado;
    const nomeNormalizado = nome.trim();
    const chave = nomeNormalizado.toLocaleLowerCase();
    if (!vistos.has(chave)) {
      vistos.add(chave);
      resultado.push(nomeNormalizado);
    }
    return resultado;
  }, []);
}

function normalizarCategorias(categorias) {
  if (!categorias || typeof categorias !== 'object') {
    return {
      receita: [...CATEGORIAS_PADRAO.receita],
      despesa: [...CATEGORIAS_PADRAO.despesa],
    };
  }

  const padraoReceita = categorias.configurado ? [] : CATEGORIAS_PADRAO.receita;
  const padraoDespesa = categorias.configurado ? [] : CATEGORIAS_PADRAO.despesa;
  return {
    receita: normalizarLista(categorias.receita, padraoReceita),
    despesa: normalizarLista(categorias.despesa, padraoDespesa),
  };
}

module.exports = {
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  CATEGORIAS_PADRAO,
  normalizarCategorias,
};