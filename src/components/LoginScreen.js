import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Field, Button, Banner } from './ui';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';

export function LoginScreen({ navigation }) {
  const { usuario, setUsuario } = useFinance();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState({});

  const entrar = () => {
    const e = {};
    if (!email.trim()) e.email = 'Informe seu e-mail.';
    if (!senha) e.senha = 'Informe sua senha.';
    setErros(e);
    if (Object.keys(e).length) return;
    // Login simulado: sem backend nesta etapa
    setUsuario({ nome: usuario.nome !== 'Visitante' ? usuario.nome : 'Nivaldo', email: email.trim() });
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <Screen>
      <View style={st.logoBox}>
        <Text style={st.logo}>to<Text style={{ color: colors.mint }}>Duro</Text></Text>
        <Text style={st.tag}>Controle financeiro pessoal</Text>
      </View>

      <Banner type="info" message="Login simulado: qualquer e-mail e senha preenchidos entram." />

      <Field
        label="E-mail" placeholder="voce@email.com" value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" error={erros.email}
      />
      <Field
        label="Senha" placeholder="Sua senha" value={senha} onChangeText={setSenha}
        secureTextEntry={!mostrar} autoCapitalize="none" error={erros.senha}
        right={
          <TouchableOpacity onPress={() => setMostrar(!mostrar)} style={{ padding: 8 }}>
            <Text style={{ color: colors.mint, fontWeight: '700' }}>{mostrar ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        }
      />

      <Button title="Entrar" onPress={entrar} style={{ marginTop: 6 }} />

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={st.link}>
        <Text style={{ color: colors.muted }}>Ainda não tem conta? <Text style={{ color: colors.mint, fontWeight: '700' }}>Criar conta</Text></Text>
      </TouchableOpacity>
    </Screen>
  );
}

const st = StyleSheet.create({
  logoBox: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logo: { color: colors.cloud, fontSize: 44, fontWeight: '800' },
  tag: { color: colors.muted, fontSize: 15, marginTop: 4 },
  link: { alignItems: 'center', padding: 18 },
});
