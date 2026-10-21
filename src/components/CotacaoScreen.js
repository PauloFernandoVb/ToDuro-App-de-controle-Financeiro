import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen, Header, Card, Field, Chips, Button, Banner, BottomNav } from './ui';
import { colors, parseValor } from '../theme';

// Valores FICTÍCIOS: quanto vale 1 unidade em reais
const TAXAS = { BRL: 1, USD: 5.1, EUR: 5.55, GBP: 6.45 };
const MOEDAS = Object.keys(TAXAS);

const agora = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const fmt = (n, casas = 2) => n.toFixed(casas).replace('.', ',');

export function CotacaoScreen({ navigation }) {
  const [origem, setOrigem] = useState('USD');
  const [destino, setDestino] = useState('BRL');
  const [valor, setValor] = useState('100');
  const [status, setStatus] = useState('ok'); // ok | loading | error
  const [atualizadoEm, setAtualizadoEm] = useState(agora());

  const taxa = TAXAS[origem] / TAXAS[destino];
  const v = parseValor(valor);
  const temValor = v > 0;

  const inverter = () => { setOrigem(destino); setDestino(origem); };

  const atualizar = () => {
    setStatus('loading');
    setTimeout(() => { setAtualizadoEm(agora()); setStatus('ok'); }, 900);
  };

  return (
    <Screen footer={<BottomNav navigation={navigation} active="Cotacao" />}>
      <Header title="Cotação de moedas" subtitle="Converta valores entre moedas" />
      <Banner type="info" message="Cotação fictícia, apenas para demonstração. Nenhuma API real é consultada." />

      <Text style={st.lbl}>De</Text>
      <Chips options={MOEDAS} value={origem} onChange={setOrigem} />

      <TouchableOpacity style={st.swap} onPress={inverter}>
        <Text style={{ color: colors.midnight, fontWeight: '800' }}>⇅ Inverter moedas</Text>
      </TouchableOpacity>

      <Text style={st.lbl}>Para</Text>
      <Chips options={MOEDAS} value={destino} onChange={setDestino} />

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
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>Falha simulada. Toque abaixo para tentar de novo.</Text>
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
          <Text style={st.resultado}>{fmt(v * taxa)} {destino}</Text>
          <View style={st.sep} />
          <Text style={{ color: colors.cloud }}>Taxa: 1 {origem} = {fmt(taxa, 4)} {destino}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>Atualizado em {atualizadoEm} (simulado)</Text>
        </Card>
      )}

      <View style={st.botoes}>
        <Button title="Atualizar cotação" onPress={atualizar} style={{ flex: 1 }} />
        <Button title="Simular erro" variant="outline" onPress={() => setStatus('error')} style={{ flex: 1 }} />
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
