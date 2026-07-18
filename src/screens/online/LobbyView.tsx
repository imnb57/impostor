import { Alert, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { CategoryPicker } from '../../components/CategoryPicker';
import { PlayerList } from '../../components/PlayerList';
import { Screen } from '../../components/Screen';
import { Stepper } from '../../components/Stepper';
import { getCategory } from '../../constants/categories';
import { colors, font, spacing } from '../../constants/theme';
import { maxImpostors } from '../../services/gameLogic';
import { startGame, updateRoomSettings } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

const MIN_PLAYERS = 3;

export function LobbyView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const players = Object.entries(room.players ?? {});
  const impostorCap = maxImpostors(players.length);

  const handleStart = () => {
    startGame(roomCode, room).catch((error) =>
      Alert.alert('Could not start', error instanceof Error ? error.message : 'Try again.'),
    );
  };

  return (
    <Screen scroll>
      <Text style={styles.codeLabel}>ROOM CODE</Text>
      <Text style={styles.code}>{roomCode}</Text>
      <Text style={styles.hint}>Friends join from their phones with this code.</Text>

      <Text style={styles.heading}>Players ({players.length})</Text>
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
          <Text style={styles.heading}>Category</Text>
          <CategoryPicker
            selectedId={room.category}
            onSelect={(id) => updateRoomSettings(roomCode, { category: id }).catch(() => {})}
          />
          <Text style={styles.heading}>Settings</Text>
          <Stepper
            label="Impostors"
            valueLabel={String(Math.min(room.impostorCount, impostorCap))}
            onDecrement={() =>
              updateRoomSettings(roomCode, {
                impostorCount: Math.max(1, room.impostorCount - 1),
              }).catch(() => {})
            }
            onIncrement={() =>
              updateRoomSettings(roomCode, {
                impostorCount: Math.min(impostorCap, room.impostorCount + 1),
              }).catch(() => {})
            }
            decrementDisabled={room.impostorCount <= 1}
            incrementDisabled={room.impostorCount >= impostorCap}
          />
          <Stepper
            label="Discussion timer"
            valueLabel={`${Math.round(room.timerSeconds / 60)} min`}
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
            decrementDisabled={room.timerSeconds <= 60}
            incrementDisabled={room.timerSeconds >= 600}
          />
          <Button
            label={
              players.length < MIN_PLAYERS
                ? `Start game (need ${MIN_PLAYERS - players.length} more)`
                : 'Start game'
            }
            disabled={players.length < MIN_PLAYERS}
            onPress={handleStart}
          />
        </>
      ) : (
        <>
          <Text style={styles.summary}>
            {getCategory(room.category).emoji} {getCategory(room.category).name} ·{' '}
            {room.impostorCount} impostor{room.impostorCount === 1 ? '' : 's'} ·{' '}
            {Math.round(room.timerSeconds / 60)} min
          </Text>
          <Text style={styles.hint}>Waiting for the host to start…</Text>
        </>
      )}

      <Button label="Leave room" variant="ghost" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeLabel: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  code: {
    color: colors.secondary,
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  heading: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  summary: {
    color: colors.text,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
