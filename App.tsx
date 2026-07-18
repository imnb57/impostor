import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/sora';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { useTheme } from './src/design/useTheme';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LocalAssassinationScreen } from './src/screens/local/LocalAssassinationScreen';
import { LocalDiscussionScreen } from './src/screens/local/LocalDiscussionScreen';
import { LocalResultsScreen } from './src/screens/local/LocalResultsScreen';
import { LocalRevealScreen } from './src/screens/local/LocalRevealScreen';
import { LocalSetupScreen } from './src/screens/local/LocalSetupScreen';
import { LocalVotingScreen } from './src/screens/local/LocalVotingScreen';
import { OnlineEntryScreen } from './src/screens/online/OnlineEntryScreen';
import { OnlineRoomScreen } from './src/screens/online/OnlineRoomScreen';
import { useSettingsStore } from './src/store/settingsStore';
import type { RootStackParamList } from './src/types/navigation';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens mid-round refuse the back gesture so a stray swipe can't
// drop a player out of a live game.
const locked = { gestureEnabled: false } as const;

export default function App() {
  const t = useTheme();
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  // Zustand's persisted settings arrive asynchronously; showing the UI before
  // they land would flash the wrong theme and re-run onboarding.
  const [hydrated, setHydrated] = useState(() => useSettingsStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const [splashDone, setSplashDone] = useState(false);
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.bg).catch(() => {});
  }, [t.bg]);

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: t.bg,
      card: t.bgElev,
      text: t.text,
      primary: t.accent,
      border: t.stroke,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!splashDone ? (
          <AnimatedSplash onDone={() => setSplashDone(true)} />
        ) : !onboardingDone ? (
          <OnboardingScreen />
        ) : (
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator
              screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="LocalSetup" component={LocalSetupScreen} />
              <Stack.Screen name="LocalReveal" component={LocalRevealScreen} options={locked} />
              <Stack.Screen name="LocalDiscussion" component={LocalDiscussionScreen} options={locked} />
              <Stack.Screen name="LocalVoting" component={LocalVotingScreen} options={locked} />
              <Stack.Screen name="LocalAssassination" component={LocalAssassinationScreen} options={locked} />
              <Stack.Screen name="LocalResults" component={LocalResultsScreen} options={locked} />
              <Stack.Screen name="OnlineEntry" component={OnlineEntryScreen} />
              <Stack.Screen name="OnlineRoom" component={OnlineRoomScreen} options={locked} />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
