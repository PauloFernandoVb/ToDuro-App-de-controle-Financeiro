import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, BottomNav } from './ui';
import { colors, formatBRL } from '../theme';
import { useFinance } from '../context/FinanceContext';

export function DashboardScreen({ navigation }) {
  const { usuario, totais, transacoes } = useFinance();
  const total = totais.receitas + totais.despesas;
  const pctRec = total ? Math.round((totais.receitas / total) * 100) : 0;
  const pctDes = total ? 100 - pctRec : 0;

  const acoes = [
    { icone: '↑', nome: 'Receita', rota: 'Receita' },
    { icone: '↓', nome: 'Despesa', rota: 'Despesa' },
    { icone: '☰', nome: 'Histórico', rota: 'Historico' },
    { icone: '$', nome: 'Cotação', rota: 'Cotacao' },
  ];

  return (
    <Screen footer={<BottomNav navigation={navigation} active="Dashboard" />}>
      <View style={st.topo}>
        <View style={{ flex: 1 }}>
          <Text style={st.ola}>Olá, {usuario.nome} 👋</Text>
          <Text style={st.sub}>Veja como estão suas finanças</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} style={st.sair}>
          <Text style={{ color: colors.muted, fontWeight: '600' }}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Card style={st.saldoCard}>
        <Text style={st.saldoLbl}>Saldo atual</Text>
        <Text style={st.saldo}>{formatBRL(totais.saldo)}</Text>
        <Text style={st.saldoNota}>Receitas − despesas</Text>
      </Card>

      <View style={st.linha}>
        <Card style={st.meio}>
          <Text style={st.mLbl}>↑ Receitas</Text>
          <Text style={st.mVal}>{formatBRL(totais.receitas)}</Text>
        </Card>
        <Card style={st.meio}>
          <Text style={st.mLbl}>↓ Despesas</Text>
          <Text style={st.mVal}>{formatBRL(totais.despesas)}</Text>
        </Card>
      </View>

      <Card style={{ marginTop: 12 }}>
        <Text style={st.mLbl}>Resumo das movimentações</Text>
        <View style={st.barra}>
          <View style={{ flex: pctRec || 0.001, backgroundColor: colors.mint }} />
          <View style={{ flex: pctDes || 0.001, backgroundColor: colors.steel }} />
        </View>
        <View style={st.legenda}>
          <Text style={st.leg}>■ Receitas {pctRec}%</Text>
          <Text style={st.leg}>□ Despesas {pctDes}%</Text>
        </View>
      </Card>

      <Text style={st.secao}>Acesso rápido</Text>
      <View style={st.linha}>
        {acoes.map((a) => (
          <TouchableOpacity key={a.nome} style={st.acao} onPress={() => navigation.navigate(a.rota)}>
            <Text style={st.acaoIcone}>{a.icone}</Text>
            <Text style={st.acaoNome}>{a.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={st.secaoLinha}>
        <Text style={[st.secao, { marginTop: 0 }]}>Movimentações recentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Historico')}>
          <Text style={{ color: colors.mint, fontWeight: '700' }}>Ver tudo</Text>
        </TouchableOpacity>
      </View>

      <Card style={{ paddingVertical: 4 }}>
        {transacoes.length === 0 ? (
          <Text style={{ color: colors.muted, padding: 14 }}>Nenhuma movimentação ainda. Adicione uma receita ou despesa.</Text>
        ) : (
          transacoes.slice(0, 5).map((t, i) => (
            <View key={t.id} style={[st.item, i > 0 && { borderTopWidth: 1, borderTopColor: colors.steel }]}>
              <View style={st.badge}><Text style={{ color: colors.mint, fontWeight: '800' }}>{t.tipo === 'receita' ? '↑' : '↓'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.itemTitulo}>{t.descricao}</Text>
                <Text style={st.itemSub}>{t.categoria} · {t.data}</Text>
              </View>
              <Text style={[st.itemVal, t.tipo === 'despesa' && { color: colors.muted }]}>
                {t.tipo === 'receita' ? '+' : '−'} {formatBRL(t.valor)}
              </Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const st = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  ola: { color: colors.cloud, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.muted, marginTop: 2 },
  sair: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.steel },
  saldoCard: { borderColor: colors.mint, padding: 20 },
  saldoLbl: { color: colors.muted, fontSize: 14 },
  saldo: { color: colors.cloud, fontSize: 36, fontWeight: '800', marginVertical: 4 },
  saldoNota: { color: colors.mint, fontSize: 12 },
  linha: { flexDirection: 'row', gap: 10, marginTop: 12 },
  meio: { flex: 1 },
  mLbl: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  mVal: { color: colors.cloud, fontSize: 18, fontWeight: '800', marginTop: 6 },
  barra: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 12, backgroundColor: colors.steel },
  legenda: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  leg: { color: colors.muted, fontSize: 12 },
  secao: { color: colors.cloud, fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 2 },
  secaoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  acao: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, backgroundColor: colors.navy,
    borderWidth: 1, borderColor: colors.steel,
  },
  acaoIcone: { color: colors.mint, fontSize: 22, fontWeight: '800' },
  acaoNome: { color: colors.cloud, fontSize: 12, marginTop: 4, fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6 },
  badge: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mintSoft, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  itemTitulo: { color: colors.cloud, fontWeight: '700', fontSize: 15 },
  itemSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  itemVal: { color: colors.cloud, fontWeight: '800', fontSize: 14 },
});
