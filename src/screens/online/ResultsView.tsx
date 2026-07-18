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
import { playAgain } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function ResultsView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const t = useTheme();
  const isHost = room.hostId === selfUid;
  const players = room.players ?? {};
  const tally = tallyVotes(room.votes ?? {});
  const tied = tally.topTargets.length !== 1;
  const votedOutUid = tied ? null : tally.topTargets[0];
  const votedOut = votedOutUid ? players[votedOutUid] : null;
  const impostorNames = Object.values(players).filter((p) => p.isImpostor).map((p) => p.name);
  const crewWins = votedOut?.isImpostor ?? false;
  const selfWasImpostor = players[selfUid]?.isImpostor ?? false;
  const selfWon = selfWasImpostor ? !crewWins : crewWins;

  useEffect(() => {
    const id = setTimeout(() => (selfWon ? haptics.success() : haptics.error()), 260);
    return () => clearTimeout(id);
  }, [selfWon]);

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
        <Text variant="caption" color={selfWon ? t.success : t.textFaint} center>
          {selfWon ? 'You won this round' : 'You lost this round'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify().damping(18)}>
        <Card style={styles.reveal}>
          <Text variant="label" faint uppercase center>
            {impostorNames.length === 1 ? 'The impostor was' : 'The impostors were'}
          </Text>
          <Text variant="heading" center color={t.accent}>
            {impostorNames.join(' · ') || '—'}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Text variant="label" faint uppercase center>
            The word was
          </Text>
          <Text variant="heading" center color={t.accentEnd}>
            {room.word}
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400)}>
        <VoteTally
          rows={Object.entries(players).map(([uid, p]) => ({
            id: uid,
            name: p.name,
            count: tally.counts[uid] ?? 0,
            highlight: p.isImpostor,
          }))}
          total={Object.keys(room.votes ?? {}).length}
        />
      </Animated.View>

      <View style={styles.actions}>
        {isHost ? (
          <Button
            label="Play again"
            onPress={() => {
              haptics.press();
              playAgain(roomCode, room).catch(() => {});
            }}
            silent
          />
        ) : (
          <Text variant="caption" dim center>
            Waiting for the host to start a new round…
          </Text>
        )}
        <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
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
