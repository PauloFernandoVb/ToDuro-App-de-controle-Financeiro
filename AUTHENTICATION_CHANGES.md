# Alterações de autenticação

## Login

- Substituído o login simulado pela autenticação de e-mail e senha do Firebase.
- Adicionada validação do formato do e-mail e da presença da senha.
- Incluídas mensagens para credenciais inválidas, conta desativada, excesso de tentativas, falhas de rede e configuração de autenticação.
- Após autenticar, o perfil é lido em `usuarios/{uid}` usando o UID retornado pelo Firebase. Perfil ausente/incompleto ou falha de leitura impede a navegação ao Dashboard.
- O contexto do usuário e a navegação para `Dashboard` só são atualizados após a autenticação e a leitura bem-sucedidas.
- A tela exibe carregamento e bloqueia envios concorrentes.

## Cadastro

- O feedback de sucesso e erro passou a ser exibido na própria tela, compatível com Expo Web.
- Mensagens de erro do Firebase Authentication são distintas de erros ao gravar o perfil no Realtime Database.
- Se a conta existir no Authentication, mas o perfil não for salvo, a mensagem informa que a conta já foi criada e orienta a não repetir o cadastro.
- Após criar conta e perfil, a tela confirma o sucesso e redireciona para `Login`.
- O cadastro bloqueia envios duplicados com uma trava e desabilita o botão enquanto processa e após concluir.
- O componente compartilhado `Button` recebeu suporte opcional a `disabled`; os outros botões mantêm seu comportamento padrão.

## Testes automatizados

O projeto usa o runner nativo de testes do Node.js, sem dependências adicionais:

```sh
npm test
```

`tests/authErrors.test.js` verifica as mensagens para erros de login, erros de leitura do perfil, falhas de cadastro no Authentication e falhas de gravação do perfil. Esses testes validam o mapeamento local de mensagens; não simulam uma conexão real com Firebase.
