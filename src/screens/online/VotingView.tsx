import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { VoteGrid } from '../../components/VoteGrid';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { radius, space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { beginAssassination, castVote, showResults } from '../../services/rooms';
import { needsAssassination } from '../../services/resolveRound';
import type { RoleId } from '../../types';
import type { OnlinePhaseProps } from './types';

export function VotingView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const t = useTheme();
  const isHost = room.hostId === selfUid;
  const players = Object.entries(room.players ?? {});
  const myVote = room.votes?.[selfUid];
  const [selected, setSelected] = useState<string | null>(null);

  const votedCount = players.filter(([, p]) => p.hasVoted).length;
  const connected = players.filter(([, p]) => p.connected);
  const allVoted = connected.length > 0 && connected.every(([, p]) => p.hasVoted);

  useEffect(() => {
    if (!isHost || !allVoted) return;
    const resolvable = players.map(([uid, p]) => ({
      id: uid,
      name: p.name,
      role: (p.role ?? (p.isImpostor ? 'impostor' : 'crew')) as RoleId,
    }));
    const next = needsAssassination(resolvable, room.votes ?? {})
      ? beginAssassination(roomCode)
      : showResults(roomCode);
    next.catch(() => {});
  }, [isHost, allVoted, roomCode, players, room.votes]);

  const confirm = () => {
    if (!selected) return;
    haptics.success();
    castVote(roomCode, selfUid, selected).catch((e) =>
      Alert.alert('Vote failed', e instanceof Error ? e.message : 'Try again.'),
    );
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="label" dim uppercase center>
          Voting
        </Text>
        <Text variant="title" center>
          {myVote ? 'Vote locked' : 'Who is the impostor?'}
        </Text>
      </Animated.View>

      {myVote ? (
        <Animated.View entering={FadeIn} style={styles.waiting}>
          <Text style={styles.emoji}>🗳️</Text>
          <Text variant="body" dim center>
            Waiting for the others…
          </Text>
          <View style={styles.progressRow}>
            {players.map(([uid, p]) => (
              <View
                key={uid}
                style={[
                  styles.pip,
                  { backgroundColor: p.hasVoted ? t.accent : t.stroke },
                ]}
              />
            ))}
          </View>
          <Text variant="caption" faint center>
            {votedCount} of {players.length} voted
          </Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.block}>
          <VoteGrid
            options={players
              .filter(([uid]) => uid !== selfUid)
              .map(([uid, p]) => ({ id: uid, name: p.name }))}
            selectedId={selected}
            onSelect={setSelected}
          />
          <Button label="Lock in vote" disabled={!selected} onPress={confirm} silent />
        </Animated.View>
      )}

      <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.lg, marginBottom: space.xl, gap: space.xs },
  block: { gap: space.lg },
  waiting: { alignItems: 'center', gap: space.md, marginVertical: space.xxl },
  emoji: { fontSize: 48, lineHeight: 56 },
  progressRow: { flexDirection: 'row', gap: space.sm },
  pip: { width: 10, height: 10, borderRadius: radius.pill },
});
