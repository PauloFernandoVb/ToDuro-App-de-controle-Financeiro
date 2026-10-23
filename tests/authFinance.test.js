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
