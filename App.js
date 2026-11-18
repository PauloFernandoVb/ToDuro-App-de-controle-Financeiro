import React from 'react';

//TELAS
import { LoginScreen } from './src/components/LoginScreen.js';
import { CadastroScreen } from './src/components/CadastroScreen.js';
import { DashboardScreen } from './src/components/DashboardScreen.js';
import { HistoricoScreen } from './src/components/HistoricoScreen.js';
import { ReceitaScreen } from './src/components/ReceitaScreen.js';
import { DespesaScreen } from './src/components/DespesaScreen.js';
import { EditarScreen } from './src/components/EditarScreen.js';
import { CotacaoScreen } from './src/components/CotacaoScreen.js';
import { GerenciarCategoriasScreen } from './src/components/GerenciarCategoriasScreen.js';
import { FinanceProvider } from './src/context/FinanceContext.js';
import { colors } from './src/theme.js';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/components/TabNavigator.js';

const MyStack = createNativeStackNavigator();

const temaToDuro = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.midnight,
    card: colors.navy,
    text: colors.cloud,
    border: colors.steel,
    primary: colors.mint,
  },
};

export default function App() {
  // Mantém os dados financeiros disponíveis em todas as telas e centraliza a navegação.
  return (
    <FinanceProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={temaToDuro}>
        <MyStack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.midnight } }}
        >
          <MyStack.Screen name="Login" component={LoginScreen} />
          <MyStack.Screen name="Cadastro" component={CadastroScreen} />

          <MyStack.Screen name="MainTabs" component={TabNavigator} />

          <MyStack.Screen name="Receita" component={ReceitaScreen} /> 
          <MyStack.Screen name="Despesa" component={DespesaScreen} />
          <MyStack.Screen name="Editar" component={EditarScreen} />
          <MyStack.Screen name="GerenciarCategorias" component={GerenciarCategoriasScreen} />
        </MyStack.Navigator>
      </NavigationContainer>
    </FinanceProvider>
  );
}
