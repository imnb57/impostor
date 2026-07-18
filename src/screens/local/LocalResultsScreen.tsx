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
import { ROLE_META } from '../../services/roles';
import { shareRecap } from '../../services/share';
import { localOutcome, useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalResultsScreen({ navigation }: ScreenProps<'LocalResults'>) {
  const t = useTheme();
  const state = useLocalGameStore();
  const cardRef = useRef<View>(null);

  const outcome = localOutcome(state);
  const crewWon = outcome.winners.includes('crew');

  const votesById: Record<string, string> = {};
  for (const [voter, target] of Object.entries(state.votes)) votesById[voter] = String(target);
  const tally = tallyVotes(votesById);

  const villains = state.players
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => p.role === 'impostor' || p.role === 'saboteur')
    .map((p) => ({ name: p.name, role: ROLE_META[p.role].label.toLowerCase() }));

  useEffect(() => {
    const id = setTimeout(() => (crewWon ? haptics.success() : haptics.error()), 260);
    return () => clearTimeout(id);
  }, [crewWon]);

  const shareData: ShareCardData = {
    outcome,
    word: state.word,
    mode: state.mode,
    categoryName: getCategory(state.categoryId).name,
    villains,
    tally: state.players
      .map((p, i) => ({
        name: p.name,
        count: tally.counts[String(i)] ?? 0,
        villain: p.role === 'impostor' || p.role === 'saboteur',
      }))
      .sort((a, b) => b.count - a.count),
    playerCount: state.players.length,
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
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
        <Card style={styles.reveal}>
          <Text variant="label" faint uppercase center>
            The word was
          </Text>
          <Text variant="heading" center color={t.accentEnd}>
            {state.word}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <View style={styles.roleList}>
            {state.players.map((p, i) => {
              const meta = ROLE_META[p.role];
              if (p.role === 'crew') return null;
              return (
                <View key={i} style={styles.roleRow}>
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
          rows={state.players.map((p, i) => ({
            id: String(i),
            name: p.name,
            count: tally.counts[String(i)] ?? 0,
            highlight: p.role === 'impostor' || p.role === 'saboteur',
          }))}
          total={Object.keys(state.votes).length}
        />
      </Animated.View>

      <View style={styles.actions}>
        <Button
          label="📸  Share this round"
          onPress={() => {
            haptics.press();
            shareRecap(cardRef, outcome, state.word);
          }}
          silent
        />
        <Button
          label="Play again — same crew"
          variant="glass"
          onPress={() => {
            state.startGame();
            navigation.replace('LocalReveal');
          }}
        />
        <Button
          label="Change players"
          variant="glass"
          onPress={() => navigation.replace('LocalSetup')}
        />
        <Button label="Home" variant="ghost" size="md" onPress={() => navigation.popToTop()} />
      </View>

      {/* Laid out for capture but parked outside the viewport. */}
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
