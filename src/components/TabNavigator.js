import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from './DashboardScreen';
import { HistoricoScreen } from './HistoricoScreen';
import { CotacaoScreen } from './CotacaoScreen';
import { colors } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarStyle: {
                    backgroundColor: colors.midnight,
                    borderTopColor: '#252A3A',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 5,
                },

                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#858B9C',

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },

                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Historico':
                            iconName = focused ? 'time' : 'time-outline';
                            break;
                        case 'Cotacao':
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                            break;
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={22}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Início' }}
            />

            <Tab.Screen
                name="Historico"
                component={HistoricoScreen}
                options={{ title: 'Histórico' }}
            />

            <Tab.Screen
                name="Cotacao"
                component={CotacaoScreen}
                options={{ title: 'Cotação' }}
            />
        </Tab.Navigator>
    );
}