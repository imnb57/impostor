import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { TimerDial } from '../../components/TimerDial';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { useCountdown } from '../../hooks/useCountdown';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalDiscussionScreen({ navigation }: ScreenProps<'LocalDiscussion'>) {
  const players = useLocalGameStore((s) => s.players);
  const timerSeconds = useLocalGameStore((s) => s.timerSeconds);

  const [endsAt] = useState(() => Date.now() + timerSeconds * 1000);
  const [starter] = useState(() =>
    players.length > 0 ? Math.floor(Math.random() * players.length) : 0,
  );
  const secondsLeft = useCountdown(endsAt);

  useEffect(() => {
    if (secondsLeft === 0) navigation.replace('LocalVoting');
  }, [secondsLeft, navigation]);

  return (
    <Screen>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="label" dim uppercase center>
          Discussion
        </Text>
      </Animated.View>

      <View style={styles.center}>
        <TimerDial
          secondsLeft={secondsLeft}
          totalSeconds={timerSeconds}
          caption={players[starter] ? `${players[starter].name} starts` : undefined}
        />

        <Animated.View entering={FadeIn.delay(400)} style={styles.rules}>
          <Text variant="body" dim center>
            Take turns describing the word{'\n'}without saying it.
          </Text>
          <Text variant="caption" faint center>
            Impostors: bluff your way through.
          </Text>
        </Animated.View>
      </View>

      <Button label="Vote now" variant="glass" onPress={() => navigation.replace('LocalVoting')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  rules: { gap: space.sm },
});
