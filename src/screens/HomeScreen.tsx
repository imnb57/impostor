import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { colors, font, radius, spacing } from '../constants/theme';
import { useGoogleProfile, useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { isFirebaseConfigured } from '../services/firebase';
import { isRunningInExpoGo, signOutOfGoogle } from '../services/googleAuth';
import { useSettingsStore } from '../store/settingsStore';
import type { ScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const playerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);

  const profile = useGoogleProfile();
  const google = useGoogleSignIn((signedInProfile) => {
    if (signedInProfile?.displayName && !useSettingsStore.getState().playerName.trim()) {
      setPlayerName(signedInProfile.displayName);
    }
  });

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.title}>🕵️ IMPOSTOR</Text>
        <Text style={styles.tagline}>
          Everyone knows the secret word. One of you is lying.
        </Text>
      </View>

      <Text style={styles.label}>Your name (used in online games)</Text>
      <TextField
        value={playerName}
        onChangeText={setPlayerName}
        placeholder="e.g. Alex"
        maxLength={16}
        autoCapitalize="words"
      />

      <View style={styles.buttons}>
        <Button
          label="🎉  Pass & Play — one phone"
          onPress={() => navigation.navigate('LocalSetup')}
        />
        <Button
          label="🌐  Play Online"
          variant="secondary"
          onPress={() => navigation.navigate('OnlineEntry')}
        />
      </View>

      {isFirebaseConfigured ? (
        <View style={styles.profileSection}>
          {profile ? (
            <View style={styles.profileRow}>
              {profile.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(profile.displayName ?? profile.email ?? '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.profileText}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.displayName ?? 'Google account'}
                </Text>
                {profile.email ? (
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {profile.email}
                  </Text>
                ) : null}
              </View>
              <Button label="Sign out" variant="ghost" onPress={() => signOutOfGoogle()} />
            </View>
          ) : (
            <>
              <Button
                label={google.busy ? 'Signing in…' : 'Continue with Google'}
                variant="secondary"
                disabled={!google.available || google.busy}
                onPress={google.signIn}
              />
              {isRunningInExpoGo ? (
                <Text style={styles.hint}>
                  Google sign-in works in the installed app (APK), not inside Expo Go.
                </Text>
              ) : null}
            </>
          )}
          {google.error ? <Text style={styles.error}>{google.error}</Text> : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  label: {
    color: colors.textDim,
    fontSize: font.small,
    marginTop: spacing.lg,
  },
  buttons: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  profileSection: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
  },
  avatarFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  profileEmail: {
    color: colors.textDim,
    fontSize: font.small,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
