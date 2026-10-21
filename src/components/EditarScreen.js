import React from 'react';
import { Text } from 'react-native';
import { Screen, Header, Button, Card } from './ui';
import { MovimentoForm } from './MovimentoForm';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';

export function EditarScreen({ navigation, route }) {
  const { transacoes, atualizar } = useFinance();
  const t = transacoes.find((x) => x.id === route.params?.id);

  if (!t) {
    return (
      <Screen>
        <Header title="Editar movimentação" onBack={() => navigation.goBack()} />
        <Card><Text style={{ color: colors.muted }}>Movimentação não encontrada. Ela pode ter sido excluída.</Text></Card>
        <Button title="Voltar ao histórico" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  return (
    <MovimentoForm
      navigation={navigation} tipo={t.tipo} inicial={t}
      titulo={t.tipo === 'receita' ? '✎ Editar receita' : '✎ Editar despesa'} subtitulo="Altere os dados e salve"
      onSalvar={(dados) => atualizar(t.id, dados)} mensagemSucesso="Movimentação atualizada."
    />
  );
}
