import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, font, spacing } from '../../constants/theme';
import { formatSeconds, useCountdown } from '../../hooks/useCountdown';
import { beginVoting } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function DiscussionView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const secondsLeft = useCountdown(room.discussionEndsAt);

  // Host's device advances the room when the shared timer expires.
  useEffect(() => {
    if (isHost && room.discussionEndsAt && secondsLeft === 0) {
      beginVoting(roomCode).catch(() => {});
    }
  }, [isHost, room.discussionEndsAt, secondsLeft, roomCode]);

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.phase}>💬 Discussion</Text>
        <Text style={styles.timer}>{formatSeconds(secondsLeft)}</Text>
        <Text style={styles.rules}>
          Take turns describing the word without saying it.{'\n'}
          Impostors: bluff your way through!
        </Text>
      </View>
      {isHost ? (
        <Button label="Skip to voting" variant="secondary" onPress={() => beginVoting(roomCode).catch(() => {})} />
      ) : null}
      <Button label="Leave room" variant="ghost" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phase: {
    color: colors.textDim,
    fontSize: font.heading,
    fontWeight: '600',
  },
  timer: {
    color: colors.text,
    fontSize: 72,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginVertical: spacing.md,
  },
  rules: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 22,
  },
});
