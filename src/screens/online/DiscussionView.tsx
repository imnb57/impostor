import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { TimerDial } from '../../components/TimerDial';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { useCountdown } from '../../hooks/useCountdown';
import { beginVoting } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function DiscussionView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const secondsLeft = useCountdown(room.discussionEndsAt);

  // The host's device is the clock of record for the room.
  useEffect(() => {
    if (isHost && room.discussionEndsAt && secondsLeft === 0) {
      beginVoting(roomCode).catch(() => {});
    }
  }, [isHost, room.discussionEndsAt, secondsLeft, roomCode]);

  return (
    <Screen>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="label" dim uppercase center>
          Discussion
        </Text>
      </Animated.View>

      <View style={styles.center}>
        <TimerDial secondsLeft={secondsLeft} totalSeconds={room.timerSeconds} />
        <Animated.View entering={FadeIn.delay(400)} style={styles.rules}>
          <Text variant="body" dim center>
            Describe the word{'\n'}without saying it.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {isHost ? (
          <Button label="Skip to voting" variant="glass" onPress={() => beginVoting(roomCode).catch(() => {})} />
        ) : null}
        <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  rules: { gap: space.sm },
  footer: { gap: space.xs },
});
