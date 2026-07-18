import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { RoleCard } from '../../components/RoleCard';
import { Screen } from '../../components/Screen';
import { getCategory } from '../../constants/categories';
import { colors, font, spacing } from '../../constants/theme';
import { beginDiscussion } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function RoleRevealView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const self = room.players?.[selfUid];

  return (
    <Screen>
      <Text style={styles.heading}>Your role</Text>
      <RoleCard
        isImpostor={self?.isImpostor ?? false}
        word={room.word}
        categoryName={getCategory(room.category).name}
      />
      {isHost ? (
        <Button
          label="Everyone's ready — start discussion"
          onPress={() => beginDiscussion(roomCode, room.timerSeconds).catch(() => {})}
        />
      ) : (
        <Text style={styles.hint}>Waiting for the host to start the discussion…</Text>
      )}
      <Button label="Leave room" variant="ghost" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
