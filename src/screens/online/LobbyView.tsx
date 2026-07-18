import { Alert, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CategoryPicker } from '../../components/CategoryPicker';
import { PlayerList } from '../../components/PlayerList';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Stepper } from '../../components/ui/Stepper';
import { Text } from '../../components/ui/Text';
import { getCategory } from '../../constants/categories';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { maxImpostors } from '../../services/gameLogic';
import { haptics } from '../../services/haptics';
import { startGame, updateRoomSettings } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

const MIN_PLAYERS = 3;

export function LobbyView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const t = useTheme();
  const isHost = room.hostId === selfUid;
  const players = Object.entries(room.players ?? {});
  const cap = maxImpostors(players.length);
  const category = getCategory(room.category);

  const share = () => {
    haptics.tap();
    Share.share({
      message: `Join my Impostor game — room code ${roomCode}. Get the app: https://imnb57.github.io/impostor/`,
    }).catch(() => {});
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.codeBlock}>
        <Text variant="label" faint uppercase center>
          Room code
        </Text>
        <Text variant="code" center color={t.accentEnd}>
          {roomCode}
        </Text>
        <Button label="Share invite" variant="ghost" size="md" onPress={share} silent />
      </Animated.View>

      <Text variant="label" dim uppercase style={styles.sectionLabel}>
        Players · {players.length}
      </Text>
      <PlayerList
        players={players.map(([uid, p]) => ({
          id: uid,
          name: p.name + (uid === selfUid ? ' (you)' : ''),
          badge:
            [uid === room.hostId ? '👑 host' : null, !p.connected ? 'offline' : null]
              .filter(Boolean)
              .join(' · ') || undefined,
          dimmed: !p.connected,
        }))}
      />

      {isHost ? (
        <>
          <Text variant="label" dim uppercase style={styles.sectionLabel}>
            Category
          </Text>
          <CategoryPicker
            selectedId={room.category}
            onSelect={(id) => updateRoomSettings(roomCode, { category: id }).catch(() => {})}
          />

          <Text variant="label" dim uppercase style={styles.sectionLabel}>
            Round
          </Text>
          <Card>
            <Stepper
              label="Impostors"
              hint={`Up to ${cap} with this group`}
              value={String(Math.min(room.impostorCount, cap))}
              onDecrement={() =>
                updateRoomSettings(roomCode, {
                  impostorCount: Math.max(1, room.impostorCount - 1),
                }).catch(() => {})
              }
              onIncrement={() =>
                updateRoomSettings(roomCode, {
                  impostorCount: Math.min(cap, room.impostorCount + 1),
                }).catch(() => {})
              }
              minusDisabled={room.impostorCount <= 1}
              plusDisabled={room.impostorCount >= cap}
            />
            <View style={[styles.divider, { backgroundColor: t.stroke }]} />
            <Stepper
              label="Discussion"
              value={`${Math.round(room.timerSeconds / 60)} min`}
              onDecrement={() =>
                updateRoomSettings(roomCode, {
                  timerSeconds: Math.max(60, room.timerSeconds - 60),
                }).catch(() => {})
              }
              onIncrement={() =>
                updateRoomSettings(roomCode, {
                  timerSeconds: Math.min(600, room.timerSeconds + 60),
                }).catch(() => {})
              }
              minusDisabled={room.timerSeconds <= 60}
              plusDisabled={room.timerSeconds >= 600}
            />
          </Card>

          <Button
            label={
              players.length < MIN_PLAYERS
                ? `Waiting for ${MIN_PLAYERS - players.length} more`
                : 'Start game'
            }
            disabled={players.length < MIN_PLAYERS}
            onPress={() => {
              haptics.success();
              startGame(roomCode, room).catch((e) =>
                Alert.alert('Could not start', e instanceof Error ? e.message : 'Try again.'),
              );
            }}
            style={styles.start}
            silent
          />
        </>
      ) : (
        <Card style={styles.waiting}>
          <Text variant="bodyStrong" center>
            {category.emoji}  {category.name}
          </Text>
          <Text variant="caption" faint center>
            {room.impostorCount} impostor{room.impostorCount === 1 ? '' : 's'} ·{' '}
            {Math.round(room.timerSeconds / 60)} min discussion
          </Text>
          <Text variant="caption" dim center style={styles.waitingNote}>
            Waiting for the host to start…
          </Text>
        </Card>
      )}

      <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeBlock: { alignItems: 'center', gap: space.xs, marginBottom: space.lg },
  sectionLabel: { marginTop: space.xl, marginBottom: space.md },
  divider: { height: 1, marginVertical: space.sm },
  start: { marginTop: space.xl },
  waiting: { marginTop: space.xl, gap: space.xs },
  waitingNote: { marginTop: space.sm },
});
