import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ShareCard, type ShareCardData } from '../../components/ShareCard';
import { VoteTally } from '../../components/VoteTally';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { getCategory } from '../../constants/categories';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { tallyVotes } from '../../services/gameLogic';
import { haptics } from '../../services/haptics';
import { resolveRound } from '../../services/resolveRound';
import { ROLE_META } from '../../services/roles';
import { shareRecap } from '../../services/share';
import { playAgain } from '../../services/rooms';
import type { RoleId } from '../../types';
import type { OnlinePhaseProps } from './types';

export function ResultsView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const t = useTheme();
  const cardRef = useRef<View>(null);
  const isHost = room.hostId === selfUid;
  const players = room.players ?? {};

  const resolvable = Object.entries(players).map(([uid, p]) => ({
    id: uid,
    name: p.name,
    role: (p.role ?? (p.isImpostor ? 'impostor' : 'crew')) as RoleId,
  }));

  const outcome = resolveRound({
    players: resolvable,
    votes: room.votes ?? {},
    assassinGuess: room.assassinGuess ?? null,
  });

  const tally = tallyVotes(room.votes ?? {});
  const selfRole = resolvable.find((p) => p.id === selfUid)?.role ?? 'crew';
  const selfWon = outcome.winners.includes(selfRole);
  const crewWon = outcome.winners.includes('crew');

  useEffect(() => {
    const id = setTimeout(() => (selfWon ? haptics.success() : haptics.error()), 260);
    return () => clearTimeout(id);
  }, [selfWon]);

  const shareData: ShareCardData = {
    outcome,
    word: room.word,
    mode: room.mode ?? 'classic',
    categoryName: getCategory(room.category).name,
    villains: resolvable
      .filter((p) => p.role === 'impostor' || p.role === 'saboteur')
      .map((p) => ({ name: p.name, role: ROLE_META[p.role].label.toLowerCase() })),
    tally: resolvable
      .map((p) => ({
        name: p.name,
        count: tally.counts[p.id] ?? 0,
        villain: p.role === 'impostor' || p.role === 'saboteur',
      }))
      .sort((a, b) => b.count - a.count),
    playerCount: resolvable.length,
  };

  return (
    <Screen scroll>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.verdict}>
        <Text style={styles.emoji}>{crewWon ? '🎉' : '😈'}</Text>
        <Text variant="title" center color={crewWon ? t.success : t.accent}>
          {outcome.headline}
        </Text>
        <Text variant="body" dim center>
          {outcome.detail}
        </Text>
        <Text variant="caption" color={selfWon ? t.success : t.textFaint} center>
          {selfWon ? 'You won this round' : 'You lost this round'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
        <Card style={styles.reveal}>
          <Text variant="label" faint uppercase center>
            The word was
          </Text>
          <Text variant="heading" center color={t.accentEnd}>
            {room.word}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <View style={styles.roleList}>
            {resolvable
              .filter((p) => p.role !== 'crew')
              .map((p) => {
                const meta = ROLE_META[p.role];
                return (
                  <View key={p.id} style={styles.roleRow}>
                    <Text variant="caption" dim>
                      {meta.emoji} {p.name}
                    </Text>
                    <Text variant="caption" color={meta.sinister ? t.accent : t.accentEnd}>
                      {meta.label}
                    </Text>
                  </View>
                );
              })}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(380)}>
        <VoteTally
          rows={resolvable.map((p) => ({
            id: p.id,
            name: p.name,
            count: tally.counts[p.id] ?? 0,
            highlight: p.role === 'impostor' || p.role === 'saboteur',
          }))}
          total={Object.keys(room.votes ?? {}).length}
        />
      </Animated.View>

      <View style={styles.actions}>
        <Button
          label="📸  Share this round"
          onPress={() => {
            haptics.press();
            shareRecap(cardRef, outcome, room.word);
          }}
          silent
        />
        {isHost ? (
          <Button
            label="Play again"
            variant="glass"
            onPress={() => playAgain(roomCode, room).catch(() => {})}
          />
        ) : (
          <Text variant="caption" dim center>
            Waiting for the host to start a new round…
          </Text>
        )}
        <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
      </View>

      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard ref={cardRef} data={shareData} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: { alignItems: 'center', gap: space.sm, marginTop: space.xl, marginBottom: space.xl },
  emoji: { fontSize: 64, lineHeight: 72 },
  reveal: { gap: space.xs, alignItems: 'center' },
  divider: { height: 1, alignSelf: 'stretch', marginVertical: space.base },
  roleList: { alignSelf: 'stretch', gap: space.sm },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { marginTop: space.xxl, gap: space.sm },
  offscreen: { position: 'absolute', left: -10000, top: 0 },
});
