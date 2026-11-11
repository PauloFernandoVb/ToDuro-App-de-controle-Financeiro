import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Banner, Button, Chips, Field, Header, Screen } from './ui';
import { colors } from '../theme';
import { useFinance } from '../context/FinanceContext';

export function GerenciarCategoriasScreen({ navigation, route }) {
  const { categorias, carregandoCategorias, adicionarCategoria, removerCategoria } = useFinance();
  const [tipo, setTipo] = useState(route.params?.tipo === 'despesa' ? 'despesa' : 'receita');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const adicionar = async () => {
    if (salvando || carregandoCategorias) return;
    setErro('');
    setSalvando(true);
    try {
      await adicionarCategoria(tipo, nome);
      setNome('');
    } catch (falha) {
      setErro(falha.message || 'Não foi possível cadastrar a categoria.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (categoria) => {
    Alert.alert(
      'Excluir categoria?',
      `A categoria "${categoria}" deixará de aparecer nos novos lançamentos. Movimentações existentes serão mantidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setErro('');
            try {
              await removerCategoria(tipo, categoria);
            } catch {
              setErro('Não foi possível excluir a categoria. Verifique sua conexão e tente novamente.');
            }
          },
        },
      ]
    );
  };

  const tipoVisivel = tipo === 'receita' ? 'Receitas' : 'Despesas';

  return (
    <Screen>
      <Header title="Gerenciar categorias" subtitle="Personalize seus lançamentos" onBack={() => navigation.goBack()} />
      <Chips
        options={['Receitas', 'Despesas']}
        value={tipoVisivel}
        onChange={(opcao) => {
          setTipo(opcao === 'Receitas' ? 'receita' : 'despesa');
          setErro('');
        }}
      />
      <View style={{ height: 20 }} />
      <Field
        label="Nome da categoria"
        placeholder="Ex.: Pets"
        value={nome}
        onChangeText={setNome}
        maxLength={40}
        returnKeyType="done"
        onSubmitEditing={adicionar}
      />
      <Banner type="error" message={erro} />
      <Button
        title={salvando ? 'Salvando...' : 'Adicionar categoria'}
        onPress={adicionar}
        disabled={salvando || carregandoCategorias}
      />

      <Text style={{ color: colors.cloud, fontSize: 17, fontWeight: '700', marginTop: 26, marginBottom: 12 }}>
        {tipoVisivel} cadastradas
      </Text>
      {carregandoCategorias ? (
        <Text style={{ color: colors.muted, fontSize: 14 }}>Carregando categorias...</Text>
      ) : categorias[tipo].length ? categorias[tipo].map((categoria) => (
        <View
          key={categoria}
          style={{
            minHeight: 54,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.steel,
          }}
        >
          <Text style={{ color: colors.cloud, fontSize: 15, flex: 1 }}>{categoria}</Text>
          <TouchableOpacity
            onPress={() => confirmarExclusao(categoria)}
            accessibilityRole="button"
            accessibilityLabel={`Excluir categoria ${categoria}`}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: colors.cloud, fontSize: 23 }}>×</Text>
          </TouchableOpacity>
        </View>
      )) : (
        <Text style={{ color: colors.muted, fontSize: 14 }}>Nenhuma categoria cadastrada.</Text>
      )}
    </Screen>
  );
}