import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, space } from '../design/tokens';
import { useGradient, useTheme } from '../design/useTheme';
import { getMode } from '../services/roles';
import type { GameMode, RoundOutcome } from '../types';
import { Text } from './ui/Text';

export interface ShareCardData {
  outcome: RoundOutcome;
  word: string;
  mode: GameMode;
  categoryName: string;
  /** Everyone who was secretly against the crew, revealed. */
  villains: { name: string; role: string }[];
  /** Name → votes received, highest first. */
  tally: { name: string; count: number; villain: boolean }[];
  playerCount: number;
}

/** Portrait aspect that survives being cropped into a story or a chat preview. */
export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 540;

/**
 * The post-game artefact. Rendered off-screen, captured as a PNG and pushed
 * into the share sheet — every share carries the download link, which is the
 * whole point of it existing.
 */
export const ShareCard = forwardRef<View, { data: ShareCardData }>(({ data }, ref) => {
  const t = useTheme();
  const gradient = useGradient();
  const mode = getMode(data.mode);
  const crewWon = data.outcome.winners.includes('crew');

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, { backgroundColor: t.bg, borderColor: t.stroke }]}
    >
      <LinearGradient
        colors={[gradient[0] + '2E', gradient[1] + '1C', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text variant="label" faint uppercase>
          {mode.emoji}  {mode.name} · {data.categoryName}
        </Text>
      </View>

      <View style={styles.verdict}>
        <Text style={styles.emoji}>{crewWon ? '🎉' : '😈'}</Text>
        <Text variant="title" center color={crewWon ? t.success : t.accent}>
          {data.outcome.headline}
        </Text>
        <Text variant="caption" dim center>
          {data.outcome.detail}
        </Text>
      </View>

      <View style={[styles.wordBox, { borderColor: t.stroke, backgroundColor: t.surface }]}>
        <Text variant="label" faint uppercase center>
          The word was
        </Text>
        <Text variant="heading" center color={t.accentEnd}>
          {data.word}
        </Text>
      </View>

      <View style={styles.villains}>
        {data.villains.map((v) => (
          <View
            key={v.name + v.role}
            style={[styles.villainChip, { borderColor: t.accent, backgroundColor: t.surface }]}
          >
            <Text variant="caption" color={t.accent}>
              {v.name} · {v.role}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.tally}>
        {data.tally.slice(0, 4).map((row) => (
          <View key={row.name} style={styles.tallyRow}>
            <Text variant="caption" color={row.villain ? t.accent : t.textDim} numberOfLines={1}>
              {row.name}
            </Text>
            <View style={[styles.track, { backgroundColor: t.surface }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: row.villain ? t.accent : t.textFaint,
                    width: `${Math.max(6, (row.count / Math.max(1, data.playerCount)) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text variant="caption" faint>
              {row.count}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: t.stroke }]}>
        <Text variant="bodyStrong">🕵️ IMPOSTOR</Text>
        <Text variant="caption" faint>
          imnb57.github.io/impostor
        </Text>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: space.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center' },
  verdict: { alignItems: 'center', gap: space.xs },
  emoji: { fontSize: 46, lineHeight: 54 },
  wordBox: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
    gap: 2,
  },
  villains: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  villainChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: space.xs + 2,
    paddingHorizontal: space.md,
  },
  tally: { gap: space.sm },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  track: { flex: 1, height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  footer: {
    borderTopWidth: 1,
    paddingTop: space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
