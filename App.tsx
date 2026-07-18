import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { LocalDiscussionScreen } from './src/screens/local/LocalDiscussionScreen';
import { LocalResultsScreen } from './src/screens/local/LocalResultsScreen';
import { LocalRevealScreen } from './src/screens/local/LocalRevealScreen';
import { LocalSetupScreen } from './src/screens/local/LocalSetupScreen';
import { LocalVotingScreen } from './src/screens/local/LocalVotingScreen';
import { OnlineEntryScreen } from './src/screens/online/OnlineEntryScreen';
import { OnlineRoomScreen } from './src/screens/online/OnlineRoomScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
};

// Mid-game screens block the back gesture so a stray swipe can't dump
// players out of a running round.
const lockedScreen = { gestureEnabled: false } as const;

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LocalSetup" component={LocalSetupScreen} />
          <Stack.Screen name="LocalReveal" component={LocalRevealScreen} options={lockedScreen} />
          <Stack.Screen
            name="LocalDiscussion"
            component={LocalDiscussionScreen}
            options={lockedScreen}
          />
          <Stack.Screen name="LocalVoting" component={LocalVotingScreen} options={lockedScreen} />
          <Stack.Screen name="LocalResults" component={LocalResultsScreen} options={lockedScreen} />
          <Stack.Screen name="OnlineEntry" component={OnlineEntryScreen} />
          <Stack.Screen name="OnlineRoom" component={OnlineRoomScreen} options={lockedScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
