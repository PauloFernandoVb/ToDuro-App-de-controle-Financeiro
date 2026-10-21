import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Screen, Header, Field, Chips, Button } from './ui';
import { colors, parseValor, dataValida, hojeBR, CATEGORIAS_RECEITA, CATEGORIAS_DESPESA } from '../theme';

// Formulário compartilhado por Receita, Despesa e Editar
export function MovimentoForm({ navigation, tipo, inicial, titulo, subtitulo, onSalvar, mensagemSucesso }) {
  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace('.', ',') : '');
  const [categoria, setCategoria] = useState(inicial?.categoria ?? '');
  const [data, setData] = useState(inicial?.data ?? hojeBR());
  const [obs, setObs] = useState(inicial?.obs ?? '');
  const [erros, setErros] = useState({});

  const salvar = () => {
    const e = {};
    const v = parseValor(valor);
    if (!descricao.trim()) e.descricao = 'Informe a descrição.';
    if (!(v > 0)) e.valor = 'Informe um valor maior que zero.';
    if (!categoria) e.categoria = 'Selecione uma categoria.';
    if (!dataValida(data)) e.data = 'Use o formato DD/MM/AAAA com uma data real.';
    setErros(e);
    if (Object.keys(e).length) return;

    onSalvar({ tipo, descricao: descricao.trim(), valor: v, categoria, data, obs: obs.trim() });
    Alert.alert('Tudo certo ✓', mensagemSucesso, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <Screen>
      <Header title={titulo} subtitle={subtitulo} onBack={() => navigation.goBack()} />
      <Field
        label={tipo === 'receita' ? 'Descrição da receita' : 'Descrição da despesa'}
        placeholder={tipo === 'receita' ? 'Ex.: Salário' : 'Ex.: Almoço'}
        value={descricao} onChangeText={setDescricao} error={erros.descricao}
      />
      <Field label="Valor (R$)" placeholder="0,00" value={valor} onChangeText={setValor} keyboardType="decimal-pad" error={erros.valor} />

      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Categoria</Text>
      <Chips options={categorias} value={categoria} onChange={setCategoria} />
      {erros.categoria ? <Text style={{ color: colors.cloud, fontSize: 12, marginTop: 5 }}>⚠ {erros.categoria}</Text> : null}

      <View style={{ height: 16 }} />
      <Field label="Data" placeholder="DD/MM/AAAA" value={data} onChangeText={setData} keyboardType="numbers-and-punctuation" maxLength={10} error={erros.data} />
      <Field label="Observações (opcional)" placeholder="Algum detalhe extra" value={obs} onChangeText={setObs} multiline style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }} />

      <Button title="Salvar" onPress={salvar} style={{ marginTop: 6 }} />
      <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
    </Screen>
  );
}
