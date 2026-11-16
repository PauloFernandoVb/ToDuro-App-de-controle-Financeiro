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
const { normalizarCategorias } = require('../utils/categoryData');

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState(normalizarCategorias(null));
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [usuario, setUsuario] = useState({ nome: 'Visitante', email: '' });
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(true);
  const [erroTransacoes, setErroTransacoes] = useState('');

  // Ao trocar a sessão, encerra os listeners antigos e acompanha apenas os dados do UID atual.
  useEffect(() => {
    let pararDeOuvirTransacoes;
    let pararDeOuvirCategorias;

    const pararDeOuvirAutenticacao = onAuthStateChanged(
      auth,
      (usuarioAutenticado) => {
        pararDeOuvirTransacoes?.();
        pararDeOuvirCategorias?.();
        pararDeOuvirTransacoes = undefined;
        pararDeOuvirCategorias = undefined;
        setTransacoes([]);
        setCategorias(normalizarCategorias(null));
        setCarregandoCategorias(true);
        setErroTransacoes('');

        if (!usuarioAutenticado) {
          setUsuario({ nome: 'Visitante', email: '' });
          setCarregandoCategorias(false);
          setCarregandoTransacoes(false);
          return;
        }

        const uid = usuarioAutenticado.uid;
        setCarregandoCategorias(true);
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

        pararDeOuvirCategorias = onValue(
          ref(database, `usuarios/${uid}/categorias`),
          (snapshot) => {
            if (auth.currentUser?.uid !== uid) return;
            setCategorias(normalizarCategorias(snapshot.val()));
            setCarregandoCategorias(false);
          },
          () => {
            if (auth.currentUser?.uid !== uid) return;
            setCategorias(normalizarCategorias(null));
            setCarregandoCategorias(false);
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
      pararDeOuvirCategorias?.();
    };
  }, []);

  // Os totais e a lista ordenada são recalculados quando as movimentações mudam.
  const ordenadas = useMemo(() => ordenarTransacoes(transacoes), [transacoes]);

  const totais = useMemo(() => calcularTotais(transacoes), [transacoes]);

  // As operações de escrita usam o caminho da conta autenticada.
  const adicionar = async (transacao) => {
    console.log('adicionar', transacao);
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

  const salvarCategorias = async (novasCategorias) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw Object.assign(new Error('Nenhum usuário autenticado.'), { code: 'auth/no-current-user' });
    }
    await set(ref(database, `usuarios/${uid}/categorias`), {
      ...novasCategorias,
      configurado: true,
    });
  };

  const adicionarCategoria = async (tipo, nome) => {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) throw new Error('Informe o nome da categoria.');
    if (categorias[tipo].some((atual) => atual.toLocaleLowerCase() === nomeNormalizado.toLocaleLowerCase())) {
      throw new Error('Essa categoria já está cadastrada.');
    }
    await salvarCategorias({
      ...categorias,
      [tipo]: [...categorias[tipo], nomeNormalizado],
    });
  };

  const removerCategoria = async (tipo, nome) => {
    await salvarCategorias({
      ...categorias,
      [tipo]: categorias[tipo].filter((atual) => atual !== nome),
    });
  };

  const sair = () => signOut(auth);

  const value = {
    transacoes: ordenadas,
    categorias,
    carregandoCategorias,
    totais,
    usuario,
    setUsuario,
    carregandoTransacoes,
    erroTransacoes,
    adicionar,
    atualizar,
    remover,
    adicionarCategoria,
    removerCategoria,
    sair,
  };
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);
