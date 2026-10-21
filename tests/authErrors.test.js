const assert = require('node:assert/strict');
const test = require('node:test');

const {
  loginAuthErrorMessage,
  loginProfileErrorMessage,
  registrationAuthErrorMessage,
  registrationProfileErrorMessage,
} = require('../src/utils/authErrors');

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
