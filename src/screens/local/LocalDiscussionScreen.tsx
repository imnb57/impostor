import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, font, spacing } from '../../constants/theme';
import { formatSeconds, useCountdown } from '../../hooks/useCountdown';
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
    if (secondsLeft === 0) {
      navigation.replace('LocalVoting');
    }
  }, [secondsLeft, navigation]);

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.phase}>💬 Discussion</Text>
        <Text style={styles.timer}>{formatSeconds(secondsLeft)}</Text>
        {players[starter] ? (
          <Text style={styles.hint}>{players[starter].name} describes the word first.</Text>
        ) : null}
        <Text style={styles.rules}>
          Take turns describing the word without saying it.{'\n'}
          Impostors: bluff your way through!
        </Text>
      </View>
      <Button label="Vote now" onPress={() => navigation.replace('LocalVoting')} />
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
  hint: {
    color: colors.secondary,
    fontSize: font.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  rules: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 22,
  },
});
