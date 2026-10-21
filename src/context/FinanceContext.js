import React, { createContext, useContext, useMemo, useState } from 'react';
import { chaveData } from '../theme';

const FinanceContext = createContext(null);

const DADOS_INICIAIS = [
  { id: 1, tipo: 'receita', descricao: 'Salário mensal', valor: 4200, categoria: 'Salário', data: '05/10/2026', obs: '' },
  { id: 2, tipo: 'despesa', descricao: 'Aluguel', valor: 1350, categoria: 'Moradia', data: '06/10/2026', obs: 'Venc. dia 6' },
  { id: 3, tipo: 'despesa', descricao: 'Supermercado', valor: 482.9, categoria: 'Alimentação', data: '09/10/2026', obs: '' },
  { id: 4, tipo: 'receita', descricao: 'Projeto de site', valor: 900, categoria: 'Freelance', data: '12/10/2026', obs: 'Cliente Sorelle' },
  { id: 5, tipo: 'despesa', descricao: 'Metrô e ônibus', valor: 145, categoria: 'Transporte', data: '14/10/2026', obs: '' },
  { id: 6, tipo: 'despesa', descricao: 'Cinema', valor: 64, categoria: 'Lazer', data: '16/10/2026', obs: '' },
  { id: 7, tipo: 'receita', descricao: 'Rendimento CDB', valor: 87.35, categoria: 'Investimentos', data: '17/10/2026', obs: '' },
  { id: 8, tipo: 'despesa', descricao: 'Consulta médica', valor: 220, categoria: 'Saúde', data: '18/10/2026', obs: '' },
];

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState(DADOS_INICIAIS);
  const [usuario, setUsuario] = useState({ nome: 'Visitante', email: '' });

  const ordenadas = useMemo(
    () => [...transacoes].sort((a, b) => chaveData(b.data).localeCompare(chaveData(a.data)) || b.id - a.id),
    [transacoes]
  );

  const totais = useMemo(() => {
    const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const despesas = transacoes.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]);

  const adicionar = (t) => setTransacoes((lista) => [...lista, { ...t, id: Date.now() }]);
  const atualizar = (id, dados) =>
    setTransacoes((lista) => lista.map((t) => (t.id === id ? { ...t, ...dados } : t)));
  const remover = (id) => setTransacoes((lista) => lista.filter((t) => t.id !== id));

  const value = { transacoes: ordenadas, totais, usuario, setUsuario, adicionar, atualizar, remover };
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);
