import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Header, Card, Field, Chips, Button, BottomNav, Banner } from './ui';
import { colors, formatBRL } from '../theme';
import { useFinance } from '../context/FinanceContext';

const FILTROS = ['Todas', 'Receitas', 'Despesas'];

export function HistoricoScreen({ navigation }) {
  const {
    transacoes,
    remover,
    carregandoTransacoes,
    erroTransacoes,
  } = useFinance();
  const [filtro, setFiltro] = useState('Todas');
  const [busca, setBusca] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');

  const lista = transacoes.filter((t) => {
    if (filtro === 'Receitas' && t.tipo !== 'receita') return false;
    if (filtro === 'Despesas' && t.tipo !== 'despesa') return false;
    return t.descricao.toLowerCase().includes(busca.trim().toLowerCase());
  });

  const excluir = async (t) => {
    setErroExclusao('');
    try {
      await remover(t.id);
    } catch (erro) {
      setErroExclusao(
        erro.code === 'PERMISSION_DENIED'
          ? 'O acesso foi negado. Verifique as regras do Realtime Database.'
          : 'Não foi possível excluir a movimentação. Verifique sua conexão e tente novamente.'
      );
    }
  };

  const confirmarExclusao = (t) =>
    Alert.alert('Excluir movimentação', `Deseja excluir "${t.descricao}" (${formatBRL(t.valor)})? Essa ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluir(t) },
    ]);

  return (
    <Screen footer={<BottomNav navigation={navigation} active="Historico" />}>
      <Header
        title="Histórico"
        subtitle={
          carregandoTransacoes
            ? 'Carregando movimentações...'
            : erroTransacoes
              ? 'Movimentações indisponíveis'
              : `${lista.length} movimentação(ões)`
        }
      />
      <Banner type="error" message={erroExclusao || erroTransacoes} />

      <Field label="Buscar por descrição" placeholder="Ex.: mercado" value={busca} onChangeText={setBusca} />
      <View style={{ marginBottom: 16 }}>
        <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
      </View>

      <View style={st.acoesTopo}>
        <Button title="↑ Nova receita" variant="outline" onPress={() => navigation.navigate('Receita')} style={{ flex: 1 }} />
        <Button title="↓ Nova despesa" variant="outline" onPress={() => navigation.navigate('Despesa')} style={{ flex: 1 }} />
      </View>

      {carregandoTransacoes ? (
        <Card style={{ marginTop: 16, alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.muted }}>Carregando movimentações...</Text>
        </Card>
      ) : erroTransacoes ? (
        <Card style={{ marginTop: 16, alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            Não foi possível carregar o histórico. Corrija o acesso ao banco e tente novamente.
          </Text>
        </Card>
      ) : lista.length === 0 ? (
        <Card style={{ marginTop: 16, alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.cloud, fontWeight: '700', fontSize: 16 }}>Nada por aqui</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>
            Nenhuma movimentação corresponde ao filtro ou à busca atual.
          </Text>
        </Card>
      ) : (
        lista.map((t) => (
          <Card key={t.id} style={{ marginTop: 12 }}>
            <View style={st.topo}>
              <View style={st.badge}><Text style={{ color: colors.mint, fontWeight: '800' }}>{t.tipo === 'receita' ? '↑' : '↓'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.titulo}>{t.descricao}</Text>
                <Text style={st.sub}>{t.tipo === 'receita' ? 'Receita' : 'Despesa'} · {t.categoria} · {t.data}</Text>
              </View>
              <Text style={[st.valor, t.tipo === 'despesa' && { color: colors.muted }]}>
                {t.tipo === 'receita' ? '+' : '−'} {formatBRL(t.valor)}
              </Text>
            </View>
            <View style={st.acoes}>
              <TouchableOpacity style={st.acaoBtn} onPress={() => navigation.navigate('Editar', { id: t.id })}>
                <Text style={{ color: colors.mint, fontWeight: '700' }}>✎ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.acaoBtn} onPress={() => confirmarExclusao(t)}>
                <Text style={{ color: colors.muted, fontWeight: '700' }}>🗑 Excluir</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  acoesTopo: { flexDirection: 'row', gap: 10 },
  topo: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titulo: { color: colors.cloud, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.cloud, fontWeight: '800', fontSize: 14 },
  acoes: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.steel, marginTop: 12, paddingTop: 4 },
  acaoBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
});
