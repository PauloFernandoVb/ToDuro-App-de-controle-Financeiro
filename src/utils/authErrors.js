function loginAuthErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada. Entre em contato com o suporte.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Aguarde um pouco e tente novamente.';
    case 'auth/network-request-failed':
      return 'Não foi possível conectar ao serviço. Verifique sua conexão com a internet.';
    case 'auth/invalid-email':
      return 'O e-mail informado é inválido.';
    case 'auth/operation-not-allowed':
      return 'O login por e-mail e senha não está habilitado. Entre em contato com o suporte.';
    default:
      return 'Não foi possível entrar. Tente novamente.';
  }
}

function loginProfileErrorMessage(code) {
  if (code === 'PERMISSION_DENIED' || code === 'database/permission-denied') {
    return 'Sua conta foi autenticada, mas o acesso ao perfil foi negado. Verifique as permissões do banco.';
  }

  return 'Sua conta foi autenticada, mas não foi possível carregar seu perfil. Verifique sua conexão e tente novamente.';
}

function registrationAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/invalid-email':
      return 'O e-mail informado é inválido.';
    case 'auth/weak-password':
      return 'Escolha uma senha mais forte.';
    case 'auth/network-request-failed':
      return 'Verifique sua conexão com a internet e tente novamente.';
    default:
      return 'Não foi possível criar sua conta. Tente novamente.';
  }
}

function registrationProfileErrorMessage(code) {
  const detalhe = code === 'PERMISSION_DENIED' || code === 'database/permission-denied'
    ? 'O acesso ao Realtime Database foi negado; verifique as regras do banco.'
    : 'Não foi possível gravar o perfil no Realtime Database. Verifique sua conexão e as permissões do banco.';

  return `A conta foi criada, mas o perfil não foi salvo. ${detalhe} Não tente criar a conta novamente; acesse o login ou contate o suporte.`;
}

module.exports = {
  loginAuthErrorMessage,
  loginProfileErrorMessage,
  registrationAuthErrorMessage,
  registrationProfileErrorMessage,
};
