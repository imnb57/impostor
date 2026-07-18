import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, font, radius, spacing } from '../../constants/theme';
import { tallyVotes } from '../../services/gameLogic';
import { playAgain } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function ResultsView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const players = room.players ?? {};
  const tally = tallyVotes(room.votes ?? {});
  const isTie = tally.topTargets.length !== 1;
  const votedOutUid = isTie ? null : tally.topTargets[0];
  const votedOut = votedOutUid ? players[votedOutUid] : null;
  const impostorNames = Object.values(players)
    .filter((p) => p.isImpostor)
    .map((p) => p.name);
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
          {impostorNames.length === 1 ? 'The impostor was' : 'The impostors were'}
        </Text>
        <Text style={styles.cardValue}>{impostorNames.join(', ') || '—'}</Text>
        <Text style={styles.cardLabel}>The word was</Text>
        <Text style={styles.cardValue}>{room.word}</Text>
      </View>

      <Text style={styles.tallyHeading}>Votes</Text>
      {Object.entries(players)
        .map(([uid, p]) => ({ name: p.name, count: tally.counts[uid] ?? 0 }))
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
        {isHost ? (
          <Button
            label="Play again — back to lobby"
            onPress={() => playAgain(roomCode, room).catch(() => {})}
          />
        ) : (
          <Text style={styles.hint}>Waiting for the host to start a new round…</Text>
        )}
        <Button label="Leave room" variant="ghost" onPress={onLeave} />
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
    textAlign: 'center',
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
  hint: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  buttons: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
