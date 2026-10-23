import React, { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Screen, Header, Field, Chips, Button, Banner } from './ui';
import { colors, parseValor, dataValida, hojeBR, CATEGORIAS_RECEITA, CATEGORIAS_DESPESA } from '../theme';
const { formatarValorMonetario } = require('../utils/financeData');

// Formulário compartilhado por Receita, Despesa e Editar
export function MovimentoForm({
  navigation,
  tipo,
  inicial,
  titulo,
  subtitulo,
  onSalvar,
  mensagemSucesso,
  rotaAposSalvar,
  rotaAoCancelar,
}) {
  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [valor, setValor] = useState(
    inicial ? formatarValorMonetario(String(Math.round(inicial.valor * 100))) : ''
  );
  const [categoria, setCategoria] = useState(inicial?.categoria ?? '');
  const [data, setData] = useState(inicial?.data ?? hojeBR());
  const [obs, setObs] = useState(inicial?.obs ?? '');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const envioEmAndamento = useRef(false);

  const salvar = async () => {
    if (envioEmAndamento.current) return;

    const e = {};
    const v = parseValor(valor);
    if (!descricao.trim()) e.descricao = 'Informe a descrição.';
    if (!(v > 0)) e.valor = 'Informe um valor maior que zero.';
    if (!categoria) e.categoria = 'Selecione uma categoria.';
    if (!dataValida(data)) e.data = 'Use o formato DD/MM/AAAA com uma data real.';
    setErros(e);
    if (Object.keys(e).length) return;

    envioEmAndamento.current = true;
    setSalvando(true);
    setErroSalvar('');

    try {
      await onSalvar({
        tipo,
        descricao: descricao.trim(),
        valor: v,
        categoria,
        data,
        obs: obs.trim(),
      });
      if (rotaAposSalvar) {
        navigation.reset({
          index: 0,
          routes: [{
            name: rotaAposSalvar,
            params: { mensagemSucesso, tipoMensagem: 'success' },
          }],
        });
      } else {
        Alert.alert('Tudo certo ✓', mensagemSucesso, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (erro) {
      if (erro.code === 'PERMISSION_DENIED') {
        setErroSalvar('O acesso foi negado. Verifique as regras do Realtime Database.');
      } else if (erro.code === 'auth/no-current-user') {
        setErroSalvar('Sua sessão expirou. Entre novamente antes de salvar.');
      } else {
        setErroSalvar('Não foi possível salvar a movimentação. Verifique sua conexão e tente novamente.');
      }
    } finally {
      envioEmAndamento.current = false;
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <Header
        title={titulo}
        subtitle={subtitulo}
        onBack={() => {
          if (rotaAoCancelar) {
            navigation.reset({
              index: 0,
              routes: [{
                name: rotaAoCancelar,
                params: {
                  mensagemSucesso: 'Lançamento cancelado.',
                  tipoMensagem: 'info',
                },
              }],
            });
          } else {
            navigation.goBack();
          }
        }}
      />
      <Banner type="error" message={erroSalvar} />
      <Field
        label={tipo === 'receita' ? 'Descrição da receita' : 'Descrição da despesa'}
        placeholder={tipo === 'receita' ? 'Ex.: Salário' : 'Ex.: Almoço'}
        value={descricao} onChangeText={setDescricao} error={erros.descricao}
      />
      <Field
        label="Valor (R$)"
        placeholder="0,00"
        value={valor}
        onChangeText={(texto) => setValor(formatarValorMonetario(texto))}
        keyboardType="decimal-pad"
        error={erros.valor}
      />

      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Categoria</Text>
      <Chips options={categorias} value={categoria} onChange={setCategoria} />
      {erros.categoria ? <Text style={{ color: colors.cloud, fontSize: 12, marginTop: 5 }}>⚠ {erros.categoria}</Text> : null}

      <View style={{ height: 16 }} />
      <Field label="Data" placeholder="DD/MM/AAAA" value={data} onChangeText={setData} keyboardType="numbers-and-punctuation" maxLength={10} error={erros.data} />
      <Field label="Observações (opcional)" placeholder="Algum detalhe extra" value={obs} onChangeText={setObs} multiline style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }} />

      <Button
        title={salvando ? 'Salvando...' : 'Salvar'}
        onPress={salvar}
        disabled={salvando}
        style={{ marginTop: 6 }}
      />
      <Button
        title="Cancelar"
        variant="outline"
        onPress={() => {
          if (rotaAoCancelar) {
            navigation.reset({
              index: 0,
              routes: [{
                name: rotaAoCancelar,
                params: {
                  mensagemSucesso: 'Lançamento cancelado.',
                  tipoMensagem: 'info',
                },
              }],
            });
          } else {
            navigation.goBack();
          }
        }}
        disabled={salvando}
        style={{ marginTop: 10 }}
      />
    </Screen>
  );
}
