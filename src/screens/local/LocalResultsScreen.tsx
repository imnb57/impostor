import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { VoteTally } from '../../components/VoteTally';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { tallyVotes } from '../../services/gameLogic';
import { haptics } from '../../services/haptics';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalResultsScreen({ navigation }: ScreenProps<'LocalResults'>) {
  const t = useTheme();
  const players = useLocalGameStore((s) => s.players);
  const votes = useLocalGameStore((s) => s.votes);
  const word = useLocalGameStore((s) => s.word);
  const startGame = useLocalGameStore((s) => s.startGame);

  const votesById: Record<string, string> = {};
  for (const [voter, target] of Object.entries(votes)) votesById[voter] = String(target);

  const tally = tallyVotes(votesById);
  const tied = tally.topTargets.length !== 1;
  const votedOutIndex = tied ? null : Number(tally.topTargets[0]);
  const votedOut = votedOutIndex !== null ? players[votedOutIndex] : null;
  const impostors = players.filter((p) => p.isImpostor);
  const crewWins = votedOut?.isImpostor ?? false;

  useEffect(() => {
    const id = setTimeout(() => (crewWins ? haptics.success() : haptics.error()), 260);
    return () => clearTimeout(id);
  }, [crewWins]);

  return (
    <Screen scroll>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.verdict}>
        <Text style={styles.emoji}>{crewWins ? '🎉' : '😈'}</Text>
        <Text variant="title" center color={crewWins ? t.success : t.accent}>
          {crewWins ? 'Impostor caught!' : 'The impostor got away'}
        </Text>
        <Text variant="body" dim center>
          {votedOut ? `${votedOut.name} was voted out.` : 'The vote was tied — nobody went home.'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify().damping(18)}>
        <Card style={styles.reveal}>
          <Text variant="label" faint uppercase center>
            {impostors.length === 1 ? 'The impostor was' : 'The impostors were'}
          </Text>
          <Text variant="heading" center color={t.accent}>
            {impostors.map((p) => p.name).join(' · ') || '—'}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Text variant="label" faint uppercase center>
            The word was
          </Text>
          <Text variant="heading" center color={t.accentEnd}>
            {word}
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400)}>
        <VoteTally
          rows={players.map((p, i) => ({
            id: String(i),
            name: p.name,
            count: tally.counts[String(i)] ?? 0,
            highlight: p.isImpostor,
          }))}
          total={players.length}
        />
      </Animated.View>

      <View style={styles.actions}>
        <Button
          label="Play again — same crew"
          onPress={() => {
            haptics.press();
            startGame();
            navigation.replace('LocalReveal');
          }}
          silent
        />
        <Button
          label="Change players"
          variant="glass"
          onPress={() => navigation.replace('LocalSetup')}
        />
        <Button label="Home" variant="ghost" size="md" onPress={() => navigation.popToTop()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: { alignItems: 'center', gap: space.sm, marginTop: space.xl, marginBottom: space.xl },
  emoji: { fontSize: 64, lineHeight: 72 },
  reveal: { gap: space.xs, alignItems: 'center' },
  divider: { height: 1, alignSelf: 'stretch', marginVertical: space.base },
  actions: { marginTop: space.xxl, gap: space.sm },
});
