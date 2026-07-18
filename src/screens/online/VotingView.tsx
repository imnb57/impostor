import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { VoteGrid } from '../../components/VoteGrid';
import { colors, font, spacing } from '../../constants/theme';
import { castVote, showResults } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function VotingView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const players = Object.entries(room.players ?? {});
  const myVote = room.votes?.[selfUid];
  const [selected, setSelected] = useState<string | null>(null);

  const votedCount = players.filter(([, p]) => p.hasVoted).length;
  const connectedPlayers = players.filter(([, p]) => p.connected);
  const allVoted =
    connectedPlayers.length > 0 && connectedPlayers.every(([, p]) => p.hasVoted);

  // Host's device reveals results once every connected player has voted.
  useEffect(() => {
    if (isHost && allVoted) {
      showResults(roomCode).catch(() => {});
    }
  }, [isHost, allVoted, roomCode]);

  const confirmVote = () => {
    if (!selected) return;
    castVote(roomCode, selfUid, selected).catch((error) =>
      Alert.alert('Vote failed', error instanceof Error ? error.message : 'Try again.'),
    );
  };

  return (
    <Screen scroll>
      <Text style={styles.phase}>🗳️ Voting</Text>
      {myVote ? (
        <>
          <Text style={styles.hint}>Vote cast! Waiting for the others…</Text>
          <Text style={styles.progress}>
            {votedCount} of {players.length} voted
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.hint}>Who is the impostor?</Text>
          <VoteGrid
            options={players
              .filter(([uid]) => uid !== selfUid)
              .map(([uid, p]) => ({ id: uid, name: p.name }))}
            selectedId={selected}
            onSelect={setSelected}
          />
          <Button label="Confirm vote" disabled={!selected} onPress={confirmVote} />
        </>
      )}
      <Button label="Leave room" variant="ghost" onPress={onLeave} />
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
  hint: {
    color: colors.text,
    fontSize: font.body,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  progress: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
  },
});
