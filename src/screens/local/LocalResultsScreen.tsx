import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, font, radius, spacing } from '../../constants/theme';
import { tallyVotes } from '../../services/gameLogic';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalResultsScreen({ navigation }: ScreenProps<'LocalResults'>) {
  const players = useLocalGameStore((s) => s.players);
  const votes = useLocalGameStore((s) => s.votes);
  const word = useLocalGameStore((s) => s.word);
  const startGame = useLocalGameStore((s) => s.startGame);

  const votesById: Record<string, string> = {};
  for (const [voter, target] of Object.entries(votes)) {
    votesById[voter] = String(target);
  }
  const tally = tallyVotes(votesById);
  const isTie = tally.topTargets.length !== 1;
  const votedOutIndex = isTie ? null : Number(tally.topTargets[0]);
  const votedOut = votedOutIndex !== null ? players[votedOutIndex] : null;
  const impostors = players.filter((p) => p.isImpostor);
  const crewWins = votedOut?.isImpostor ?? false;

  return (
    <Screen scroll>
      <Text style={styles.verdict}>
        {crewWins ? '🎉 Impostor caught!' : '😈 The impostor got away!'}
      </Text>
      <Text style={styles.votedOut}>
        {votedOut
          ? `${votedOut.name} was voted out.`
          : 'The vote was tied — no one was voted out.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          {impostors.length === 1 ? 'The impostor was' : 'The impostors were'}
        </Text>
        <Text style={styles.cardValue}>
          {impostors.map((p) => p.name).join(', ') || '—'}
        </Text>
        <Text style={styles.cardLabel}>The word was</Text>
        <Text style={styles.cardValue}>{word}</Text>
      </View>

      <Text style={styles.tallyHeading}>Votes</Text>
      {players
        .map((p, i) => ({ name: p.name, count: tally.counts[String(i)] ?? 0 }))
        .sort((a, b) => b.count - a.count)
        .map((row) => (
          <View key={row.name + row.count} style={styles.tallyRow}>
            <Text style={styles.tallyName}>{row.name}</Text>
            <Text style={styles.tallyCount}>
              {row.count} vote{row.count === 1 ? '' : 's'}
            </Text>
          </View>
        ))}

      <View style={styles.buttons}>
        <Button
          label="Play again — same crew"
          onPress={() => {
            startGame();
            navigation.replace('LocalReveal');
          }}
        />
        <Button
          label="Change players or settings"
          variant="secondary"
          onPress={() => navigation.replace('LocalSetup')}
        />
        <Button label="Home" variant="ghost" onPress={() => navigation.popToTop()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  votedOut: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.xs,
  },
  cardLabel: {
    color: colors.textDim,
    fontSize: font.small,
    marginTop: spacing.sm,
  },
  cardValue: {
    color: colors.secondary,
    fontSize: font.heading,
    fontWeight: '800',
  },
  tallyHeading: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  tallyName: {
    color: colors.text,
    fontSize: font.body,
  },
  tallyCount: {
    color: colors.textDim,
    fontSize: font.body,
  },
  buttons: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
