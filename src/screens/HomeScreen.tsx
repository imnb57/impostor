import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { TextField } from '../components/ui/TextField';
import { radius, space } from '../design/tokens';
import { useActionGradient, useTheme } from '../design/useTheme';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useGoogleProfile } from '../hooks/useGoogleSignIn';
import { isFirebaseConfigured } from '../services/firebase';
import { haptics } from '../services/haptics';
import { canUseGoogleSignIn, isRunningInExpoGo, signOutOfGoogle } from '../services/googleAuth';
import { useSettingsStore } from '../store/settingsStore';
import type { ScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const t = useTheme();
  const gradient = useActionGradient();
  const playerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);

  const profile = useGoogleProfile();

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            haptics.tap();
            navigation.navigate('Settings');
          }}
          style={[styles.gear, { backgroundColor: t.surface, borderColor: t.stroke }]}
        >
          <Text variant="bodyStrong">⚙︎</Text>
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.hero}>
        <Text style={styles.mark}>🕵️</Text>
        <Text variant="display" center>
          IMPOSTOR
        </Text>
        <Text variant="body" dim center style={styles.tagline}>
          Everyone knows the word.{'\n'}One of you is lying.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(90).springify().damping(18)}>
        <TextField
          label="Your name"
          value={playerName}
          onChangeText={setPlayerName}
          placeholder="Used in online games"
          maxLength={16}
          autoCapitalize="words"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).springify().damping(18)} style={styles.modes}>
        <Pressable
          onPress={() => {
            haptics.press();
            navigation.navigate('LocalSetup');
          }}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryMode}
          >
            <Text style={styles.modeEmoji}>🎉</Text>
            <View style={styles.modeText}>
              <Text variant="heading" color={t.onAccent}>
                Pass &amp; Play
              </Text>
              <Text variant="caption" color={t.onAccent}>
                One phone · works offline
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Card
          onPress={() => {
            haptics.press();
            navigation.navigate('OnlineEntry');
          }}
          style={styles.secondaryMode}
        >
          <Text style={styles.modeEmoji}>🌐</Text>
          <View style={styles.modeText}>
            <Text variant="heading">Play Online</Text>
            <Text variant="caption" faint>
              Join friends with a room code
            </Text>
          </View>
        </Card>
      </Animated.View>

      {isFirebaseConfigured ? (
        <Animated.View entering={FadeIn.delay(240)} style={styles.account}>
          {profile ? (
            <View style={styles.profileRow}>
              {profile.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: t.surface }]} />
              )}
              <View style={styles.profileText}>
                <Text variant="caption" numberOfLines={1}>
                  {profile.displayName ?? 'Signed in'}
                </Text>
                <Text variant="caption" faint numberOfLines={1}>
                  {profile.email ?? ''}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => {
                  haptics.tap();
                  signOutOfGoogle();
                }}
              >
                <Text variant="caption" faint>
                  Sign out
                </Text>
              </Pressable>
            </View>
          ) : canUseGoogleSignIn() ? (
            <GoogleAuthButton
              onSignedIn={(signedIn) => {
                if (signedIn?.displayName && !useSettingsStore.getState().playerName.trim()) {
                  setPlayerName(signedIn.displayName);
                }
              }}
            />
          ) : isRunningInExpoGo ? (
            <Text variant="caption" faint center>
              Google sign-in works in the installed app
            </Text>
          ) : null}
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  gear: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginTop: space.lg, marginBottom: space.xxl, gap: space.xs },
  mark: { fontSize: 60, lineHeight: 68 },
  tagline: { marginTop: space.sm },
  modes: { marginTop: space.xl, gap: space.md },
  primaryMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  secondaryMode: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  modeEmoji: { fontSize: 32, lineHeight: 38 },
  modeText: { flex: 1, gap: 2 },
  account: { marginTop: space.xxl, gap: space.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 34, height: 34, borderRadius: radius.pill },
  profileText: { flex: 1 },
  googleBtn: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
  },
});
