import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { Screen, Header, Field, Button } from './ui';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';

export function CadastroScreen({ navigation }) {
  const { setUsuario } = useFinance();
  const [f, setF] = useState({ nome: '', telefone: '', email: '', senha: '', confirma: '' });
  const [erros, setErros] = useState({});
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const criar = () => {
    const e = {};
    if (!f.nome.trim()) e.nome = 'Informe seu nome completo.';
    if (f.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone com DDD.';
    if (!f.email.trim()) e.email = 'Informe seu e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Formato de e-mail inválido.';
    if (f.senha.length < 6) e.senha = 'A senha precisa ter ao menos 6 caracteres.';
    if (f.confirma !== f.senha || !f.confirma) e.confirma = 'As senhas não coincidem.';
    setErros(e);
    if (Object.keys(e).length) return;

    setUsuario({ nome: f.nome.trim().split(' ')[0], email: f.email.trim() });
    Alert.alert('Conta criada ✓', 'Cadastro simulado concluído. Agora é só entrar.', [
      { text: 'Ir para o login', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <Screen>
      <Header title="Criar conta" subtitle="Preencha seus dados para começar" onBack={() => navigation.goBack()} />
      <Field label="Nome completo" placeholder="Seu nome" value={f.nome} onChangeText={set('nome')} error={erros.nome} />
      <Field label="Telefone" placeholder="(11) 99999-9999" value={f.telefone} onChangeText={set('telefone')} keyboardType="phone-pad" error={erros.telefone} />
      <Field label="E-mail" placeholder="voce@email.com" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" error={erros.email} />
      <Field label="Senha" placeholder="Mínimo de 6 caracteres" value={f.senha} onChangeText={set('senha')} secureTextEntry autoCapitalize="none" error={erros.senha} />
      <Field label="Confirmar senha" placeholder="Repita a senha" value={f.confirma} onChangeText={set('confirma')} secureTextEntry autoCapitalize="none" error={erros.confirma} />
      <Button title="Criar conta" onPress={criar} style={{ marginTop: 6 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', padding: 18 }}>
        <Text style={{ color: colors.muted }}>Já tem conta? <Text style={{ color: colors.mint, fontWeight: '700' }}>Voltar ao login</Text></Text>
      </TouchableOpacity>
    </Screen>
  );
}
