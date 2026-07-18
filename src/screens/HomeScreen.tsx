import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { colors, font, spacing } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import type { ScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const playerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);

  return (
    <Screen>
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
});
