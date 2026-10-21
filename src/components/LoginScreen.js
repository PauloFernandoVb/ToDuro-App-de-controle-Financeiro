import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { Screen, Field, Button, Banner } from './ui';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';
import { auth, database } from '../../services/firebase.js';

const {
  loginAuthErrorMessage,
  loginProfileErrorMessage,
} = require('../utils/authErrors');

export function LoginScreen({ navigation }) {
  const { setUsuario } = useFinance();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const envioEmAndamento = useRef(false);

  const entrar = async () => {
    if (envioEmAndamento.current) return;

    const e = {};
    const emailInformado = email.trim();
    if (!emailInformado) {
      e.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInformado)) {
      e.email = 'Informe um e-mail válido.';
    }
    if (!senha) e.senha = 'Informe sua senha.';
    setErros(e);
    setMensagem('');
    if (Object.keys(e).length) return;

    envioEmAndamento.current = true;
    setCarregando(true);

    let autenticado = false;
    try {
      const credencial = await signInWithEmailAndPassword(auth, emailInformado, senha);
      autenticado = true;

      const resultado = await get(ref(database, `usuarios/${credencial.user.uid}`));
      if (!resultado.exists()) {
        setMensagem('Sua conta foi autenticada, mas o perfil não foi encontrado. Entre em contato com o suporte.');
        return;
      }

      const perfil = resultado.val();
      if (
        typeof perfil?.nome !== 'string'
        || !perfil.nome.trim()
        || typeof perfil?.email !== 'string'
        || !perfil.email.trim()
      ) {
        setMensagem('Sua conta foi autenticada, mas o perfil está incompleto. Entre em contato com o suporte.');
        return;
      }

      setUsuario({ nome: perfil.nome.trim().split(' ')[0], email: perfil.email.trim() });
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (erro) {
      setMensagem(
        autenticado
          ? loginProfileErrorMessage(erro.code)
          : loginAuthErrorMessage(erro.code)
      );
    } finally {
      envioEmAndamento.current = false;
      setCarregando(false);
    }
  };

  return (
    <Screen>
      <View style={st.logoBox}>
        <Text style={st.logo}>to<Text style={{ color: colors.mint }}>Duro</Text></Text>
        <Text style={st.tag}>Controle financeiro pessoal</Text>
      </View>

      <Banner type="error" message={mensagem} />

      <Field
        label="E-mail" placeholder="voce@email.com" value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        editable={!carregando} error={erros.email}
      />
      <Field
        label="Senha" placeholder="Sua senha" value={senha} onChangeText={setSenha}
        secureTextEntry={!mostrar} autoCapitalize="none" editable={!carregando}
        error={erros.senha}
        right={
          <TouchableOpacity
            onPress={() => setMostrar(!mostrar)}
            disabled={carregando}
            style={{ padding: 8 }}
          >
            <Text style={{ color: colors.mint, fontWeight: '700' }}>{mostrar ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        }
      />

      <Button
        title={carregando ? 'Entrando...' : 'Entrar'}
        onPress={entrar}
        style={{ marginTop: 6, opacity: carregando ? 0.6 : 1 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('Cadastro')}
        disabled={carregando}
        style={st.link}
      >
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
