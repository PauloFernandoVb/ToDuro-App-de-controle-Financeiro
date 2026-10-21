import React from 'react';
import { MovimentoForm } from './MovimentoForm';
import { useFinance } from '../context/FinanceContext';

export function DespesaScreen({ navigation }) {
  const { adicionar } = useFinance();
  return (
    <MovimentoForm
      navigation={navigation} tipo="despesa" titulo="↓ Nova despesa" subtitulo="Registre uma saída de dinheiro"
      onSalvar={adicionar} mensagemSucesso="Despesa cadastrada e saldo atualizado."
    />
  );
}
