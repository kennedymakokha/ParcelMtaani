/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import "./global.css"
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootStack from './src/navigations/stacks/rootStack';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}



export default App;
