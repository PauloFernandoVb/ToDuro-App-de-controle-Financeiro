import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import { auth, database } from '../../services/firebase.js';
const {
  calcularTotais,
  caminhoTransacoesDoUsuario,
  normalizarTransacoes,
  ordenarTransacoes,
} = require('../utils/financeData');

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [usuario, setUsuario] = useState({ nome: 'Visitante', email: '' });
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(true);
  const [erroTransacoes, setErroTransacoes] = useState('');

  useEffect(() => {
    let pararDeOuvirTransacoes;

    const pararDeOuvirAutenticacao = onAuthStateChanged(
      auth,
      (usuarioAutenticado) => {
        pararDeOuvirTransacoes?.();
        pararDeOuvirTransacoes = undefined;
        setTransacoes([]);
        setErroTransacoes('');

        if (!usuarioAutenticado) {
          setUsuario({ nome: 'Visitante', email: '' });
          setCarregandoTransacoes(false);
          return;
        }

        const uid = usuarioAutenticado.uid;
        setCarregandoTransacoes(true);
        pararDeOuvirTransacoes = onValue(
          ref(database, `usuarios/${uid}/transacoes`),
          (snapshot) => {
            if (auth.currentUser?.uid !== uid) return;

            try {
              setTransacoes(normalizarTransacoes(snapshot.val()));
              setErroTransacoes('');
              setCarregandoTransacoes(false);
            } catch {
              setTransacoes([]);
              setErroTransacoes(
                'Há movimentações com dados inválidos no banco. Corrija esses registros para exibir o resumo.'
              );
              setCarregandoTransacoes(false);
            }
          },
          (erro) => {
            if (auth.currentUser?.uid !== uid) return;

            setTransacoes([]);
            setErroTransacoes(
              erro.code === 'PERMISSION_DENIED'
                ? 'O acesso às movimentações foi negado. Verifique as regras do Realtime Database.'
                : 'Não foi possível atualizar as movimentações. Verifique sua conexão e tente novamente.'
            );
            setCarregandoTransacoes(false);
          }
        );
      },
      () => {
        setTransacoes([]);
        setCarregandoTransacoes(false);
        setErroTransacoes('Não foi possível verificar a sessão. Entre novamente.');
      }
    );

    return () => {
      pararDeOuvirAutenticacao();
      pararDeOuvirTransacoes?.();
    };
  }, []);

  const ordenadas = useMemo(() => ordenarTransacoes(transacoes), [transacoes]);

  const totais = useMemo(() => calcularTotais(transacoes), [transacoes]);

  const adicionar = async (transacao) => {
    const novoRef = push(
      ref(database, caminhoTransacoesDoUsuario(auth.currentUser?.uid))
    );
    if (!novoRef.key) {
      throw new Error('Não foi possível gerar um identificador para a movimentação.');
    }

    await set(novoRef, transacao);
    return novoRef.key;
  };

  const atualizar = async (id, dados) => {
    await update(
      ref(
        database,
        caminhoTransacoesDoUsuario(auth.currentUser?.uid, id)
      ),
      dados
    );
  };

  const remover = async (id) => {
    await remove(
      ref(
        database,
        caminhoTransacoesDoUsuario(auth.currentUser?.uid, id)
      )
    );
  };

  const sair = () => signOut(auth);

  const value = {
    transacoes: ordenadas,
    totais,
    usuario,
    setUsuario,
    carregandoTransacoes,
    erroTransacoes,
    adicionar,
    atualizar,
    remover,
    sair,
  };
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);
