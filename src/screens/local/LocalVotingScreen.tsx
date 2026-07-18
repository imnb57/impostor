import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { VoteGrid } from '../../components/VoteGrid';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { haptics } from '../../services/haptics';
import { needsAssassination } from '../../services/resolveRound';
import { localResolvables, useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalVotingScreen({ navigation }: ScreenProps<'LocalVoting'>) {
  const players = useLocalGameStore((s) => s.players);
  const castVote = useLocalGameStore((s) => s.castVote);

  const [index, setIndex] = useState(0);
  const [handedOver, setHandedOver] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const voter = players[index];
  if (!voter) return <Screen>{null}</Screen>;

  const confirm = () => {
    if (selected === null) return;
    haptics.success();
    castVote(index, Number(selected));

    if (index < players.length - 1) {
      setIndex(index + 1);
      setHandedOver(false);
      setSelected(null);
      return;
    }

    // Last vote is in — read the finished tally straight from the store.
    const finished = useLocalGameStore.getState();
    const votes: Record<string, string> = {};
    for (const [v, target] of Object.entries(finished.votes)) votes[v] = String(target);

    navigation.replace(
      needsAssassination(localResolvables(finished.players), votes)
        ? 'LocalAssassination'
        : 'LocalResults',
    );
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="label" dim uppercase center>
          Voting · {index + 1} of {players.length}
        </Text>
        <Text variant="title" center>
          {voter.name}
        </Text>
      </Animated.View>

      {!handedOver ? (
        <Animated.View key="handoff" entering={FadeIn} exiting={FadeOut.duration(140)} style={styles.block}>
          <Text variant="body" dim center>
            Pass the phone to {voter.name}.{'\n'}Votes stay secret until the end.
          </Text>
          <Button
            label={`I'm ${voter.name}`}
            onPress={() => {
              haptics.press();
              setHandedOver(true);
            }}
            silent
          />
        </Animated.View>
      ) : (
        <Animated.View key="vote" entering={FadeIn} style={styles.block}>
          <Text variant="subheading" center>
            Who is the impostor?
          </Text>
          <VoteGrid
            options={players
              .map((p, i) => ({ id: String(i), name: p.name }))
              .filter((o) => o.id !== String(index))}
            selectedId={selected}
            onSelect={setSelected}
          />
          <Button label="Lock in vote" disabled={selected === null} onPress={confirm} silent />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.lg, marginBottom: space.xl, gap: space.xs },
  block: { gap: space.lg },
});
