import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen, Header, Card, Field, Chips, Button, Banner, BottomNav } from './ui';
import { colors, parseValor } from '../theme';
const { MOEDAS_SUPORTADAS, buscarCotacao } = require('../utils/exchangeRates');

const fmt = (n, casas = 2) => n.toFixed(casas).replace('.', ',');
const formatarData = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export function CotacaoScreen({ navigation }) {
  const [origem, setOrigem] = useState('USD');
  const [destino, setDestino] = useState('BRL');
  const [valor, setValor] = useState('100');
  const [solicitacao, setSolicitacao] = useState(0);
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const ultimaSolicitacao = useRef(0);

  const v = parseValor(valor);
  const temValor = v > 0;
  const carregandoCotacao = !resultadoConsulta
    || resultadoConsulta.origem !== origem
    || resultadoConsulta.destino !== destino
    || resultadoConsulta.solicitacao !== solicitacao;
  const status = carregandoCotacao ? 'loading' : resultadoConsulta.status;
  const cotacao = carregandoCotacao ? null : resultadoConsulta.cotacao;
  const mensagemErro = carregandoCotacao ? '' : resultadoConsulta.mensagemErro;

  useEffect(() => {
    let ativa = true;
    const idSolicitacao = ++ultimaSolicitacao.current;

    buscarCotacao(origem, destino)
      .then((resultado) => {
        if (!ativa || idSolicitacao !== ultimaSolicitacao.current) return;
        setResultadoConsulta({
          origem,
          destino,
          solicitacao,
          status: 'ok',
          cotacao: resultado,
          mensagemErro: '',
        });
      })
      .catch((erro) => {
        if (!ativa || idSolicitacao !== ultimaSolicitacao.current) return;
        setResultadoConsulta({
          origem,
          destino,
          solicitacao,
          status: 'error',
          cotacao: null,
          mensagemErro: erro.message || 'Não foi possível carregar a cotação.',
        });
      });

    return () => {
      ativa = false;
    };
  }, [origem, destino, solicitacao]);

  const inverter = () => { setOrigem(destino); setDestino(origem); };
  const atualizar = () => setSolicitacao((atual) => atual + 1);

  return (
    <Screen footer={<BottomNav navigation={navigation} active="Cotacao" />}>
      <Header title="Cotação de moedas" subtitle="Converta valores entre moedas" />
      <Banner type="info" message="Cotações de referência diárias fornecidas pela Frankfurter." />

      <Text style={st.lbl}>De</Text>
      <Chips options={MOEDAS_SUPORTADAS} value={origem} onChange={setOrigem} />

      <TouchableOpacity style={st.swap} onPress={inverter}>
        <Text style={{ color: colors.midnight, fontWeight: '800' }}>⇅ Inverter moedas</Text>
      </TouchableOpacity>

      <Text style={st.lbl}>Para</Text>
      <Chips options={MOEDAS_SUPORTADAS} value={destino} onChange={setDestino} />

      <View style={{ height: 18 }} />
      <Field label={`Valor em ${origem}`} placeholder="0,00" value={valor} onChangeText={setValor} keyboardType="decimal-pad" />

      {status === 'loading' ? (
        <Card style={st.centro}>
          <ActivityIndicator color={colors.mint} />
          <Text style={{ color: colors.muted, marginTop: 10 }}>Atualizando cotação…</Text>
        </Card>
      ) : status === 'error' ? (
        <Card style={st.centro}>
          <Text style={{ color: colors.cloud, fontWeight: '700', fontSize: 16 }}>⚠ Não foi possível atualizar</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>{mensagemErro}</Text>
          <Button title="Tentar novamente" onPress={atualizar} style={{ marginTop: 14, alignSelf: 'stretch' }} />
        </Card>
      ) : !temValor ? (
        <Card style={st.centro}>
          <Text style={{ color: colors.cloud, fontWeight: '700' }}>Sem dados para converter</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>Informe um valor maior que zero.</Text>
        </Card>
      ) : (
        <Card style={{ borderColor: colors.mint }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Valor convertido</Text>
          <Text style={st.resultado}>{fmt(v * cotacao.rate)} {destino}</Text>
          <View style={st.sep} />
          <Text style={{ color: colors.cloud }}>Taxa: 1 {origem} = {fmt(cotacao.rate, 4)} {destino}</Text>
          {cotacao.date ? (
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
              Data da cotação: {formatarData(cotacao.date)}
            </Text>
          ) : null}
        </Card>
      )}

      <View style={st.botoes}>
        <Button
          title={status === 'loading' ? 'Atualizando...' : 'Atualizar cotação'}
          onPress={atualizar}
          disabled={status === 'loading'}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  lbl: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 6 },
  swap: { backgroundColor: colors.mint, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, marginVertical: 14 },
  centro: { alignItems: 'center', padding: 22 },
  resultado: { color: colors.cloud, fontSize: 30, fontWeight: '800', marginTop: 4 },
  sep: { height: 1, backgroundColor: colors.steel, marginVertical: 12 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
