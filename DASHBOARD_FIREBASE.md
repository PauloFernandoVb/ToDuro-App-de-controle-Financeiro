# Dashboard e Realtime Database

O Dashboard agora calcula saldo, receitas, despesas e movimentações recentes com os dados sincronizados do Firebase. Não há movimentações de exemplo: uma conta sem registros começa com os totais zerados.

## Estrutura adotada

Os perfis continuam no caminho usado pelo cadastro, `usuarios/{uid}`. As movimentações ficam como filhas desse perfil:

```text
usuarios/
  {uid}/
    nome: "Nome do usuário"
    telefone: "(18) 99999-9999"
    email: "usuario@exemplo.com"
    criadoEm: "2026-10-23T..."
    transacoes/
      {id-gerado-pelo-firebase}/
        tipo: "receita" | "despesa"
        descricao: "Salário"
        valor: 4200
        categoria: "Salário"
        data: "05/10/2026"
        obs: ""
```

O UID não vem de campo do formulário: a aplicação obtém o UID da sessão atual do Firebase Authentication e usa esse UID para ler e gravar os dados. O Firebase Realtime Database mantém um listener em `usuarios/{uid}/transacoes`; assim, inclusões, edições e exclusões atualizam o Dashboard e o histórico. O saldo é a soma das receitas menos a soma das despesas.

## Configuração e regras de segurança

1. No Firebase Console, confirme que **Authentication > Sign-in method > E-mail/senha** está habilitado.
2. Confirme que o Realtime Database foi criado para o mesmo projeto configurado em `services/firebase.js`.
3. Em **Realtime Database > Rules**, revise as regras existentes. A aplicação precisa de leitura e escrita autenticadas apenas no nó do próprio usuário. Uma base possível para o caminho adotado é:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

Este arquivo apenas documenta uma proposta; as regras do Firebase **não foram alteradas automaticamente**. Antes de publicar, integre a regra às regras atuais e teste no Rules Playground/Simulator. Regras permissivas em um nó pai (por exemplo, `".read": true` ou `".write": true` na raiz) também precisam ser removidas: uma regra restritiva em um nó filho não revoga permissões concedidas acima dele.

## Teste manual

1. Crie ou use uma conta cuja autenticação esteja habilitada e cujo perfil exista em `usuarios/{uid}`.
2. Entre com essa conta e confira se o Dashboard mostra carregamento e, em seguida, os totais da sua pasta `transacoes`.
3. Cadastre uma receita e uma despesa. Confirme no Console Firebase que ambas aparecem em `usuarios/{uid}/transacoes/{id}` e que saldo e totais se atualizam.
4. Edite e exclua uma movimentação; confirme que o banco, histórico e Dashboard refletem as alterações.
5. Entre com outra conta e confirme que ela não vê as movimentações da primeira.
6. Use o Rules Simulator para negar leitura/escrita e confirme que o app mostra erro, sem exibir zeros como se o carregamento tivesse sido concluído com sucesso.
7. Saia e entre novamente para confirmar que o app assina a conta certa e atualiza os dados.

## Testes automatizados

Execute `npm test` para rodar os testes da aplicação. `tests/financeData.test.js` cobre a normalização dos registros recebidos do banco, a rejeição de dados inválidos, os totais/saldo, a ordenação das movimentações recentes e a construção do caminho por UID. Os testes são unitários e não substituem o teste de integração com Firebase descrito acima.

## Observações

- Registros de demonstração que antes existiam somente em memória não são enviados ao Firebase nem migrados. Movimentações já salvas em outro caminho também não são migradas automaticamente.
- As telas de receita, despesa, edição e exclusão agora aguardam as operações do Firebase; erros de gravação são apresentados ao usuário em vez de serem tratados como sucesso.
- O contrato `usuarios/{uid}/transacoes` precisa ser compartilhado com quem mantém as telas e operações de movimentação para evitar que outra parte do app grave em um caminho diferente.
- A exportação/build local valida a integração do bundle, mas não substitui o teste com credenciais, dados e regras reais do projeto Firebase.
