import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { colors, font, spacing } from '../../constants/theme';
import { isFirebaseConfigured } from '../../services/firebase';
import { createRoom, joinRoom, RoomSession } from '../../services/rooms';
import { useRoomStore } from '../../store/roomStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { ScreenProps } from '../../types/navigation';

export function OnlineEntryScreen({ navigation }: ScreenProps<'OnlineEntry'>) {
  const playerName = useSettingsStore((s) => s.playerName);
  const lastRoomCode = useSettingsStore((s) => s.lastRoomCode);
  const setLastRoomCode = useSettingsStore((s) => s.setLastRoomCode);
  const setSession = useRoomStore((s) => s.setSession);

  const [codeDraft, setCodeDraft] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <Screen>
        <Text style={styles.heading}>Online mode isn't configured yet</Text>
        <Text style={styles.hint}>
          Copy .env.example to .env, fill in your Firebase web app credentials, and
          restart the dev server. Pass & Play works without any setup.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const name = playerName.trim();

  const enterRoom = async (action: () => Promise<RoomSession>) => {
    if (!name) {
      Alert.alert('Name needed', 'Set your name on the home screen first.');
      return;
    }
    setBusy(true);
    try {
      const session = await action();
      setSession(session.roomCode, session.uid);
      setLastRoomCode(session.roomCode);
      navigation.replace('OnlineRoom', { roomCode: session.roomCode });
    } catch (error) {
      Alert.alert(
        'Could not enter room',
        error instanceof Error ? error.message : 'Something went wrong — try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const joinCode = codeDraft.trim().toUpperCase();

  return (
    <Screen>
      <Text style={styles.heading}>Play online</Text>
      <Text style={styles.hint}>Playing as {name || '…'}</Text>

      <Button
        label="Create a room"
        disabled={busy}
        onPress={() => enterRoom(() => createRoom(name))}
      />

      <View style={styles.divider} />

      <Text style={styles.label}>Join with a room code</Text>
      <TextField
        value={codeDraft}
        onChangeText={setCodeDraft}
        placeholder="e.g. QK7M"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />
      <Button
        label="Join room"
        variant="secondary"
        disabled={busy || joinCode.length < 4}
        onPress={() => enterRoom(() => joinRoom(joinCode, name))}
      />

      {lastRoomCode ? (
        <Button
          label={`Rejoin last room — ${lastRoomCode}`}
          variant="ghost"
          disabled={busy}
          onPress={() => enterRoom(() => joinRoom(lastRoomCode, name))}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.body,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  label: {
    color: colors.textDim,
    fontSize: font.small,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});
