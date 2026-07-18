import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { VoteGrid } from '../../components/VoteGrid';
import { colors, font, spacing } from '../../constants/theme';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalVotingScreen({ navigation }: ScreenProps<'LocalVoting'>) {
  const players = useLocalGameStore((s) => s.players);
  const castVote = useLocalGameStore((s) => s.castVote);

  const [index, setIndex] = useState(0);
  const [handedOver, setHandedOver] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const voter = players[index];
  if (!voter) return <Screen>{null}</Screen>;

  const confirmVote = () => {
    if (selected === null) return;
    castVote(index, Number(selected));
    if (index === players.length - 1) {
      navigation.replace('LocalResults');
    } else {
      setIndex(index + 1);
      setHandedOver(false);
      setSelected(null);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.phase}>🗳️ Voting</Text>
      <Text style={styles.playerName}>{voter.name}</Text>

      {!handedOver ? (
        <>
          <Text style={styles.hint}>
            Pass the phone to {voter.name}. Votes stay secret until the end.
          </Text>
          <Button
            label={`I'm ${voter.name} — cast my vote`}
            onPress={() => setHandedOver(true)}
          />
        </>
      ) : (
        <>
          <Text style={styles.hint}>Who is the impostor?</Text>
          <VoteGrid
            options={players
              .map((p, i) => ({ id: String(i), name: p.name }))
              .filter((o) => o.id !== String(index))}
            selectedId={selected}
            onSelect={setSelected}
          />
          <Button label="Confirm vote" disabled={selected === null} onPress={confirmVote} />
        </>
      )}
      <Text style={styles.progress}>
        Vote {index + 1} of {players.length}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  phase: {
    color: colors.textDim,
    fontSize: font.heading,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  playerName: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  progress: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
