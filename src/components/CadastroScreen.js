
import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { ref, set as setDb } from 'firebase/database';
import { Screen, Header, Field, Button, Banner } from './ui';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';
import { auth, database } from '../../services/firebase.js';

const {
  registrationAuthErrorMessage,
  registrationProfileErrorMessage,
} = require('../utils/authErrors');

export function CadastroScreen({ navigation }) {
  const { setUsuario } = useFinance();

  const [f, setF] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirma: '',
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [concluido, setConcluido] = useState(false);
  const envioEmAndamento = useRef(false);

  const set = (k) => (v) =>
    setF((x) => ({ ...x, [k]: v }));

  const criar = async () => {
    if (envioEmAndamento.current || concluido) {
      return;
    }

    const e = {};

    if (!f.nome.trim()) {
      e.nome = 'Informe seu nome completo.';
    }

    if (f.telefone.replace(/\D/g, '').length < 10) {
      e.telefone = 'Informe um telefone com DDD.';
    }

    if (!f.email.trim()) {
      e.email = 'Informe seu e-mail.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())
    ) {
      e.email = 'Formato de e-mail inválido.';
    }

    if (f.senha.length < 6) {
      e.senha = 'A senha precisa ter ao menos 6 caracteres.';
    }

    if (!f.confirma || f.confirma !== f.senha) {
      e.confirma = 'As senhas não coincidem.';
    }

    setErros(e);

    if (Object.keys(e).length > 0 || carregando) {
      return;
    }

    setCarregando(true);
    envioEmAndamento.current = true;
    setFeedback(null);

    try {
      let credencial;
      try {
        credencial = await createUserWithEmailAndPassword(
          auth,
          f.email.trim(),
          f.senha
        );
      } catch (erro) {
        setFeedback({
          type: 'error',
          message: registrationAuthErrorMessage(erro.code),
        });
        return;
      }

      const usuario = credencial.user;
      try {
        await setDb(ref(database, `usuarios/${usuario.uid}`), {
          nome: f.nome.trim(),
          telefone: f.telefone.trim(),
          email: usuario.email,
          criadoEm: new Date().toISOString(),
        });
      } catch (erro) {
        setFeedback({
          type: 'error',
          message: registrationProfileErrorMessage(erro.code),
        });
        return;
      }

      setUsuario({
        nome: f.nome.trim().split(' ')[0],
        email: usuario.email,
      });
      setConcluido(true);
      setFeedback({
        type: 'success',
        message: 'Conta e perfil criados com sucesso! Redirecionando para o login...',
      });
      setTimeout(
        () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        1500
      );
    } finally {
      envioEmAndamento.current = false;
      setCarregando(false);
    }
  };

  return (
    <Screen>
      <Header
        title="Criar conta"
        subtitle="Preencha seus dados para começar"
        onBack={() => navigation.goBack()}
      />

      <Banner type={feedback?.type} message={feedback?.message} />

      <Field
        label="Nome completo"
        placeholder="Seu nome"
        value={f.nome}
        onChangeText={set('nome')}
        editable={!carregando && !concluido}
        error={erros.nome}
      />

      <Field
        label="Telefone"
        placeholder="(11) 99999-9999"
        value={f.telefone}
        onChangeText={set('telefone')}
        keyboardType="phone-pad"
        editable={!carregando && !concluido}
        error={erros.telefone}
      />

      <Field
        label="E-mail"
        placeholder="voce@email.com"
        value={f.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!carregando && !concluido}
        error={erros.email}
      />

      <Field
        label="Senha"
        placeholder="Mínimo de 6 caracteres"
        value={f.senha}
        onChangeText={set('senha')}
        secureTextEntry
        autoCapitalize="none"
        editable={!carregando && !concluido}
        error={erros.senha}
      />

      <Field
        label="Confirmar senha"
        placeholder="Repita a senha"
        value={f.confirma}
        onChangeText={set('confirma')}
        secureTextEntry
        autoCapitalize="none"
        editable={!carregando && !concluido}
        error={erros.confirma}
      />

      <Button
        title={carregando ? 'Criando conta...' : concluido ? 'Cadastro realizado' : 'Criar conta'}
        onPress={criar}
        disabled={carregando || concluido}
        style={{ marginTop: 6, opacity: carregando || concluido ? 0.6 : 1 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        disabled={carregando}
        style={{ alignItems: 'center', padding: 18 }}
      >
        <Text style={{ color: colors.muted }}>
          Já tem conta?{' '}
          <Text style={{ color: colors.mint, fontWeight: '700' }}>
            Voltar ao login
          </Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
