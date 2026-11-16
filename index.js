import { registerRootComponent } from 'expo';

import App from './App';

// Registra o componente principal para execução no Expo Go e nos builds nativos.
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
