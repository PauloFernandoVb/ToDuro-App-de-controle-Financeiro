import React from 'react';
import { MovimentoForm } from './MovimentoForm';
import { useFinance } from '../context/FinanceContext';

export function ReceitaScreen({ navigation }) {
  const { adicionar } = useFinance();
  // Reutiliza o formulário comum, identificando o lançamento como receita.
  return (
    <MovimentoForm
      navigation={navigation} tipo="receita" titulo="↑ Nova receita" subtitulo="Registre uma entrada de dinheiro"
      onSalvar={adicionar} mensagemSucesso="Receita cadastrada e saldo atualizado."
      rotaAposSalvar="Dashboard"
      rotaAoCancelar="Dashboard"
    />
  );
}
