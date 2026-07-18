import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { TextField } from '../../components/ui/TextField';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { isFirebaseConfigured } from '../../services/firebase';
import { haptics } from '../../services/haptics';
import { createRoom, joinRoom, RoomSession } from '../../services/rooms';
import { useRoomStore } from '../../store/roomStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { ScreenProps } from '../../types/navigation';

export function OnlineEntryScreen({ navigation }: ScreenProps<'OnlineEntry'>) {
  const t = useTheme();
  const playerName = useSettingsStore((s) => s.playerName);
  const lastRoomCode = useSettingsStore((s) => s.lastRoomCode);
  const setLastRoomCode = useSettingsStore((s) => s.setLastRoomCode);
  const setSession = useRoomStore((s) => s.setSession);

  const [codeDraft, setCodeDraft] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.emoji}>🔌</Text>
          <Text variant="heading" center>
            Online isn't configured
          </Text>
          <Text variant="body" dim center>
            Add your Firebase keys to .env and restart. Pass &amp; Play works without setup.
          </Text>
          <Button label="Back" variant="glass" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  const name = playerName.trim();

  const enter = async (action: () => Promise<RoomSession>) => {
    if (!name) {
      haptics.warning();
      Alert.alert('Name needed', 'Set your name on the home screen first.');
      return;
    }
    setBusy(true);
    try {
      const session = await action();
      haptics.success();
      setSession(session.roomCode, session.uid);
      setLastRoomCode(session.roomCode);
      navigation.replace('OnlineRoom', { roomCode: session.roomCode });
    } catch (error) {
      haptics.error();
      Alert.alert(
        'Could not enter room',
        error instanceof Error ? error.message : 'Something went wrong.',
      );
    } finally {
      setBusy(false);
    }
  };

  const joinCode = codeDraft.trim().toUpperCase();

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="title">Play online</Text>
        <Text variant="caption" faint>
          Playing as {name || 'nobody yet'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)}>
        <Button
          label="Create a room"
          disabled={busy}
          onPress={() => enter(() => createRoom(name))}
          silent
        />
      </Animated.View>

      <View style={styles.orRow}>
        <View style={[styles.rule, { backgroundColor: t.stroke }]} />
        <Text variant="caption" faint>
          or join one
        </Text>
        <View style={[styles.rule, { backgroundColor: t.stroke }]} />
      </View>

      <Animated.View entering={FadeInDown.delay(140).springify().damping(18)} style={styles.joinBlock}>
        <TextField
          code
          value={codeDraft}
          onChangeText={(v) => setCodeDraft(v.toUpperCase())}
          placeholder="CODE"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
        />
        <Button
          label="Join room"
          variant="glass"
          disabled={busy || joinCode.length < 4}
          onPress={() => enter(() => joinRoom(joinCode, name))}
          silent
        />
      </Animated.View>

      {lastRoomCode ? (
        <Button
          label={`Rejoin ${lastRoomCode}`}
          variant="ghost"
          size="md"
          disabled={busy}
          onPress={() => enter(() => joinRoom(lastRoomCode, name))}
        />
      ) : null}

      <Button label="Back" variant="ghost" size="md" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.base },
  emoji: { fontSize: 52, lineHeight: 60 },
  header: { marginBottom: space.xl, gap: space.xs },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl },
  rule: { flex: 1, height: 1 },
  joinBlock: { gap: space.md },
});
