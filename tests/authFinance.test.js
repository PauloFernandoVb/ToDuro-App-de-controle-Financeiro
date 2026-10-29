const assert = require('node:assert/strict');
const test = require('node:test');
const { readFileSync } = require('node:fs');

const {
  loginAuthErrorMessage,
  loginProfileErrorMessage,
  registrationAuthErrorMessage,
  registrationProfileErrorMessage,
} = require('../src/utils/authErrors');
const {
  calcularTotais,
  caminhoTransacoesDoUsuario,
  dataValida,
  formatarValorMonetario,
  normalizarTransacoes,
  ordenarTransacoes,
} = require('../src/utils/financeData');
const {
  MOEDAS_SUPORTADAS,
  buscarCotacao,
} = require('../src/utils/exchangeRates');

const cadastroScreenSource = readFileSync(
  require.resolve('../src/components/CadastroScreen'),
  'utf8'
);
const dashboardScreenSource = readFileSync(
  require.resolve('../src/components/DashboardScreen'),
  'utf8'
);
const financeContextSource = readFileSync(
  require.resolve('../src/context/FinanceContext'),
  'utf8'
);
const cotacaoScreenSource = readFileSync(
  require.resolve('../src/components/CotacaoScreen'),
  'utf8'
);

const transacao = (overrides = {}) => ({
  tipo: 'receita',
  descricao: 'Salário',
  valor: 4200,
  categoria: 'Trabalho',
  data: '05/10/2026',
  obs: '',
  ...overrides,
});

const loginAuthErrors = [
  ['auth/invalid-credential', 'E-mail ou senha incorretos.'],
  ['auth/invalid-login-credentials', 'E-mail ou senha incorretos.'],
  ['auth/wrong-password', 'E-mail ou senha incorretos.'],
  ['auth/user-not-found', 'E-mail ou senha incorretos.'],
  ['auth/user-disabled', 'Esta conta foi desativada. Entre em contato com o suporte.'],
  ['auth/too-many-requests', 'Muitas tentativas de login. Aguarde um pouco e tente novamente.'],
  ['auth/network-request-failed', 'Não foi possível conectar ao serviço. Verifique sua conexão com a internet.'],
  ['auth/invalid-email', 'O e-mail informado é inválido.'],
  ['auth/operation-not-allowed', 'O login por e-mail e senha não está habilitado. Entre em contato com o suporte.'],
  ['auth/unknown-error', 'Não foi possível entrar. Tente novamente.'],
];

for (const [code, expected] of loginAuthErrors) {
  test(`login shows the appropriate message for ${code}`, () => {
    assert.equal(loginAuthErrorMessage(code), expected);
  });
}

test('login distinguishes profile permission errors from other read errors', () => {
  assert.match(loginProfileErrorMessage('PERMISSION_DENIED'), /acesso ao perfil foi negado/);
  assert.match(loginProfileErrorMessage('database/permission-denied'), /acesso ao perfil foi negado/);
  assert.match(loginProfileErrorMessage('NETWORK_ERROR'), /não foi possível carregar seu perfil/);
});

const registrationAuthErrors = [
  ['auth/email-already-in-use', 'Este e-mail já está cadastrado.'],
  ['auth/invalid-email', 'O e-mail informado é inválido.'],
  ['auth/weak-password', 'Escolha uma senha mais forte.'],
  ['auth/network-request-failed', 'Verifique sua conexão com a internet e tente novamente.'],
  ['auth/unknown-error', 'Não foi possível criar sua conta. Tente novamente.'],
];

for (const [code, expected] of registrationAuthErrors) {
  test(`registration shows the appropriate message for ${code}`, () => {
    assert.equal(registrationAuthErrorMessage(code), expected);
  });
}

test('registration profile-write errors explain that the auth account already exists', () => {
  const permissionError = registrationProfileErrorMessage('PERMISSION_DENIED');
  const networkError = registrationProfileErrorMessage('NETWORK_ERROR');

  assert.match(permissionError, /Realtime Database foi negado/);
  assert.match(networkError, /foi possível gravar o perfil/i);
  for (const message of [permissionError, networkError]) {
    assert.match(message, /A conta foi criada, mas o perfil não foi salvo/);
    assert.match(message, /Não tente criar a conta novamente/);
  }
});

test('exchange rate lookup accepts the currencies offered by the screen', () => {
  assert.deepEqual(MOEDAS_SUPORTADAS, ['BRL', 'USD', 'EUR', 'GBP']);
});

test('exchange rate lookup returns the real API response fields', async () => {
  const requisitar = async (url, options) => {
    assert.equal(url, 'https://api.frankfurter.dev/v2/rate/USD/BRL');
    assert.deepEqual(options, { headers: { Accept: 'application/json' } });
    return {
      ok: true,
      json: async () => ({
        date: '2026-10-28',
        base: 'USD',
        quote: 'BRL',
        rate: 5.25,
      }),
    };
  };

  const cotacao = await buscarCotacao('USD', 'BRL', requisitar);
  assert.deepEqual(cotacao, {
    date: '2026-10-28',
    base: 'USD',
    quote: 'BRL',
    rate: 5.25,
  });
  assert.equal(10 * cotacao.rate, 52.5);
});

test('exchange rate lookup rejects unsupported currencies without making a request', async () => {
  let requisicoes = 0;
  await assert.rejects(
    buscarCotacao('USD', 'XYZ', async () => {
      requisicoes += 1;
    }),
    (erro) => erro.tipo === 'moeda-nao-suportada'
  );
  assert.equal(requisicoes, 0);
});

test('same-currency conversion uses rate one without an API date', async () => {
  let requisicoes = 0;
  const cotacao = await buscarCotacao('BRL', 'BRL', async () => {
    requisicoes += 1;
  });

  assert.deepEqual(cotacao, {
    base: 'BRL',
    quote: 'BRL',
    rate: 1,
    date: null,
  });
  assert.equal(requisicoes, 0);
});

test('exchange rate lookup distinguishes connection failures and invalid API responses', async () => {
  await assert.rejects(
    buscarCotacao('EUR', 'GBP', async () => {
      throw new Error('offline');
    }),
    (erro) => erro.tipo === 'conexao'
  );

  await assert.rejects(
    buscarCotacao('EUR', 'GBP', async () => ({
      ok: true,
      json: async () => {
        throw new Error('invalid JSON');
      },
    })),
    (erro) => erro.tipo === 'resposta-invalida'
  );

  await assert.rejects(
    buscarCotacao('EUR', 'GBP', async () => ({
      ok: true,
      json: async () => ({
        date: '2026-10-28',
        base: 'EUR',
        quote: 'GBP',
        rate: Number.NaN,
      }),
    })),
    (erro) => erro.tipo === 'resposta-invalida'
  );
});

test('exchange rate lookup reports API errors and rejects mismatched currency pairs', async () => {
  await assert.rejects(
    buscarCotacao('USD', 'EUR', async () => ({ ok: false, status: 503 })),
    (erro) => erro.tipo === 'api'
  );

  await assert.rejects(
    buscarCotacao('USD', 'EUR', async () => ({
      ok: true,
      json: async () => ({
        date: '2026-10-28',
        base: 'EUR',
        quote: 'USD',
        rate: 0.9,
      }),
    })),
    (erro) => erro.tipo === 'resposta-invalida'
  );
});

test('exchange rate screen loads on currency changes, refreshes manually, and does not request per typed character', () => {
  assert.match(cotacaoScreenSource, /ActivityIndicator color=\{colors\.mint\}/);
  assert.match(cotacaoScreenSource, /useEffect\([\s\S]*\[origem, destino, solicitacao\]\)/);
  assert.match(cotacaoScreenSource, /const atualizar = \(\) => setSolicitacao\(\(atual\) => atual \+ 1\)/);
  assert.match(cotacaoScreenSource, /onPress=\{atualizar\}/);
  assert.match(cotacaoScreenSource, /onChangeText=\{setValor\}/);
  assert.match(cotacaoScreenSource, /cotacao\.rate/);
  assert.match(cotacaoScreenSource, /cotacao\.date \?/);
  assert.match(cotacaoScreenSource, /idSolicitacao !== ultimaSolicitacao\.current/);
  assert.doesNotMatch(cotacaoScreenSource, /TAXAS|Falha simulada|Simular erro/);
});

test('registration validates all required user fields before creating an account', () => {
  assert.match(cadastroScreenSource, /if \(!f\.nome\.trim\(\)\)/);
  assert.match(cadastroScreenSource, /f\.telefone\.replace\(\/\\D\/g, ''\)\.length !== 11/);
  assert.match(cadastroScreenSource, /if \(!f\.email\.trim\(\)\)/);
  assert.match(cadastroScreenSource, /\^\[\^\\s@\]\+@\[\^\\s@\]\+\\\.\[\^\\s@\]\+\$/);
  assert.match(cadastroScreenSource, /if \(f\.senha\.length < 6\)/);
  assert.match(cadastroScreenSource, /f\.confirma !== f\.senha/);
});

test('registration creates an authenticated account and stores its profile under that uid', () => {
  assert.match(cadastroScreenSource, /createUserWithEmailAndPassword\(\s*auth,\s*f\.email\.trim\(\),\s*f\.senha\s*\)/);
  assert.match(cadastroScreenSource, /setDb\(ref\(database, `usuarios\/\$\{usuario\.uid\}`\)/);
  assert.match(cadastroScreenSource, /nome: f\.nome\.trim\(\)/);
  assert.match(cadastroScreenSource, /telefone: f\.telefone\.trim\(\)/);
  assert.match(cadastroScreenSource, /email: usuario\.email/);
});

test('registration prevents duplicate submissions and presents success or failure feedback', () => {
  assert.match(cadastroScreenSource, /if \(envioEmAndamento\.current \|\| concluido\)/);
  assert.match(cadastroScreenSource, /envioEmAndamento\.current = true/);
  assert.match(cadastroScreenSource, /finally \{[\s\S]*envioEmAndamento\.current = false/);
  assert.match(cadastroScreenSource, /setFeedback\(\{\s*type: 'success'/);
  assert.match(cadastroScreenSource, /registrationAuthErrorMessage\(erro\.code\)/);
  assert.match(cadastroScreenSource, /registrationProfileErrorMessage\(erro\.code\)/);
  assert.match(cadastroScreenSource, /disabled=\{carregando \|\| concluido\}/);
});

test('dashboard renders user totals and distinguishes loading and read errors', () => {
  assert.match(dashboardScreenSource, /useFinance\(\)/);
  assert.match(dashboardScreenSource, /formatBRL\(totais\.saldo\)/);
  assert.match(dashboardScreenSource, /formatBRL\(totais\.receitas\)/);
  assert.match(dashboardScreenSource, /formatBRL\(totais\.despesas\)/);
  assert.match(dashboardScreenSource, /carregandoTransacoes \? 'Carregando\.\.\.'/);
  assert.match(dashboardScreenSource, /erroTransacoes \? 'Indisponível'/);
  assert.match(dashboardScreenSource, /Banner type="error" message=\{erroSaida \|\| erroTransacoes\}/);
});

test('finance context listens only to the authenticated user transactions and exposes live totals', () => {
  assert.match(financeContextSource, /onAuthStateChanged\(\s*auth,/);
  assert.match(financeContextSource, /onValue\(\s*ref\(database, `usuarios\/\$\{uid\}\/transacoes`\)/);
  assert.match(financeContextSource, /if \(auth\.currentUser\?\.uid !== uid\) return/);
  assert.match(financeContextSource, /normalizarTransacoes\(snapshot\.val\(\)\)/);
  assert.match(financeContextSource, /calcularTotais\(transacoes\)/);
  assert.match(financeContextSource, /carregandoTransacoes,\s*erroTransacoes/);
  assert.match(financeContextSource, /erro\.code === 'PERMISSION_DENIED'/);
});

test('finance context writes create, edit and delete operations under the active user path', () => {
  assert.match(financeContextSource, /push\(\s*ref\(database, caminhoTransacoesDoUsuario\(auth\.currentUser\?\.uid\)\)/);
  assert.match(financeContextSource, /await set\(novoRef, transacao\)/);
  assert.match(financeContextSource, /await update\([\s\S]*caminhoTransacoesDoUsuario\(auth\.currentUser\?\.uid, id\)/);
  assert.match(financeContextSource, /await remove\([\s\S]*caminhoTransacoesDoUsuario\(auth\.currentUser\?\.uid, id\)/);
});

test('normalizes an empty Realtime Database value as no transactions', () => {
  assert.deepEqual(normalizarTransacoes(null), []);
  assert.deepEqual(normalizarTransacoes(undefined), []);
});

test('normalizes valid database entries with their Firebase keys as ids', () => {
  const resultado = normalizarTransacoes({
    '-firebase-key': transacao({ obs: undefined }),
  });

  assert.deepEqual(resultado, [{
    ...transacao(),
    id: '-firebase-key',
  }]);
});

test('rejects invalid transaction records instead of using them in totals', () => {
  const invalidas = [
    transacao({ tipo: 'transferencia' }),
    transacao({ descricao: '  ' }),
    transacao({ valor: Number.NaN }),
    transacao({ valor: -1 }),
    transacao({ categoria: '' }),
    transacao({ data: '31/02/2026' }),
    transacao({ obs: 12 }),
  ];

  for (const registro of invalidas) {
    assert.throws(
      () => normalizarTransacoes({ item: registro }),
      /Movimentação inválida/
    );
  }
});

test('rejects a non-object database payload', () => {
  assert.throws(() => normalizarTransacoes('invalid'), /Formato inválido/);
  assert.throws(() => normalizarTransacoes([]), /Formato inválido/);
});

test('calculates revenue, expenses and current balance from normalized records', () => {
  const transacoes = normalizarTransacoes({
    receita1: transacao({ valor: 4200 }),
    receita2: transacao({ tipo: 'receita', valor: 300 }),
    despesa1: transacao({ tipo: 'despesa', valor: 1500 }),
    despesa2: transacao({ tipo: 'despesa', valor: 250 }),
  });

  assert.deepEqual(calcularTotais(transacoes), {
    receitas: 4500,
    despesas: 1750,
    saldo: 2750,
  });
});

test('calculates zero totals when there are no transactions', () => {
  assert.deepEqual(calcularTotais([]), {
    receitas: 0,
    despesas: 0,
    saldo: 0,
  });
});

test('calculates the RF_09 balance scenarios from numeric database values', () => {
  const cenarios = [
    {
      transacoes: {},
      totais: { receitas: 0, despesas: 0, saldo: 0 },
    },
    {
      transacoes: {
        receita: transacao({ valor: 1000 }),
        despesa: transacao({ tipo: 'despesa', valor: 300 }),
      },
      totais: { receitas: 1000, despesas: 300, saldo: 700 },
    },
    {
      transacoes: {
        receita: transacao({ valor: 500 }),
        despesa: transacao({ tipo: 'despesa', valor: 800 }),
      },
      totais: { receitas: 500, despesas: 800, saldo: -300 },
    },
  ];

  for (const { transacoes, totais } of cenarios) {
    assert.deepEqual(
      calcularTotais(normalizarTransacoes(transacoes)),
      totais
    );
  }
});

test('formats typed currency digits as Brazilian reais with cents and thousands separators', () => {
  assert.equal(formatarValorMonetario('1'), '0,01');
  assert.equal(formatarValorMonetario('123'), '1,23');
  assert.equal(formatarValorMonetario('123456'), '1.234,56');
  assert.equal(formatarValorMonetario('R$ 1.234,56'), '1.234,56');
  assert.equal(formatarValorMonetario(''), '');
});

test('limits currency input to a safe number of digits', () => {
  assert.equal(formatarValorMonetario('123456789012345678'), '1.234.567.890.123,45');
});

test('sorts transactions newest-first for the dashboard recent activity', () => {
  const transacoes = [
    { ...transacao(), id: '-older', data: '01/10/2026' },
    { ...transacao(), id: '-newer', data: '20/10/2026' },
    { ...transacao(), id: '-middle', data: '10/10/2026' },
  ];

  assert.deepEqual(
    ordenarTransacoes(transacoes).map(({ id }) => id),
    ['-newer', '-middle', '-older']
  );
  assert.deepEqual(transacoes.map(({ id }) => id), ['-older', '-newer', '-middle']);
});

test('builds transaction paths only under the authenticated user uid', () => {
  assert.equal(
    caminhoTransacoesDoUsuario('uid-123'),
    'usuarios/uid-123/transacoes'
  );
  assert.equal(
    caminhoTransacoesDoUsuario('uid-123', '-firebase-key'),
    'usuarios/uid-123/transacoes/-firebase-key'
  );
  assert.throws(
    () => caminhoTransacoesDoUsuario(''),
    (erro) => erro.code === 'auth/no-current-user'
  );
});

test('expense form redirects to the dashboard after saving and canceling', () => {
  const expenseScreen = readFileSync(
    require.resolve('../src/components/DespesaScreen'),
    'utf8'
  );

  assert.match(expenseScreen, /rotaAposSalvar="Dashboard"/);
  assert.match(expenseScreen, /rotaAoCancelar="Dashboard"/);
});

test('validates real Brazilian dates used to sort dashboard transactions', () => {
  assert.equal(dataValida('29/02/2024'), true);
  assert.equal(dataValida('29/02/2025'), false);
  assert.equal(dataValida('31/04/2026'), false);
  assert.equal(dataValida('2026-10-05'), false);
});
