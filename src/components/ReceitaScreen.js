import React from 'react';
import { MovimentoForm } from './MovimentoForm';
import { useFinance } from '../context/FinanceContext';

export function ReceitaScreen({ navigation }) {
  const { adicionar } = useFinance();
  return (
    <MovimentoForm
      navigation={navigation} tipo="receita" titulo="↑ Nova receita" subtitulo="Registre uma entrada de dinheiro"
      onSalvar={adicionar} mensagemSucesso="Receita cadastrada e saldo atualizado."
      rotaAposSalvar="Dashboard"
      rotaAoCancelar="Dashboard"
    />
  );
}
