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
  villains: { name: string; role: string }[];
  tally: { name: string; count: number; villain: boolean }[];
  playerCount: number;
}

/**
 * 9:16 so it fills an Instagram/WhatsApp story edge to edge. Rendered in
 * logical points here and captured at 1080x1920 — see services/share.ts.
 */
export const SHARE_CARD_WIDTH = 540;
export const SHARE_CARD_HEIGHT = 960;

/**
 * The post-game playcard. Deliberately full-bleed and fully opaque: rounded
 * corners left transparent pixels that turned into a visible box when posted
 * to a story, and any alpha at all risks matte artefacts once a platform
 * flattens the PNG.
 */
export const ShareCard = forwardRef<View, { data: ShareCardData }>(({ data }, ref) => {
  const t = useTheme();
  const gradient = useGradient();
  const mode = getMode(data.mode);
  const crewWon = data.outcome.winners.includes('crew');
  const maxVotes = Math.max(1, ...data.tally.map((r) => r.count));

  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: t.bg }]}>
      {/* Explicit opaque base. The gradient above it has alpha in its upper
          stops, so without this the exported PNG carries transparency and
          picks up whatever sits behind it once posted to a story. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: t.bg }]} />
      <LinearGradient
        colors={[gradient[0] + '33', gradient[1] + '1F', t.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.headerText} color={t.textDim}>
            {mode.emoji}  {mode.name.toUpperCase()} · {data.categoryName.toUpperCase()}
          </Text>
        </View>

        <View style={styles.verdict}>
          <Text style={styles.emoji}>{crewWon ? '🎉' : '😈'}</Text>
          <Text style={styles.headline} center color={crewWon ? t.success : t.accent}>
            {data.outcome.headline}
          </Text>
          <Text style={styles.detail} center color={t.textDim}>
            {data.outcome.detail}
          </Text>
        </View>

        <View style={[styles.wordBox, { borderColor: t.strokeStrong, backgroundColor: t.bgElev }]}>
          <Text style={styles.wordLabel} center color={t.textFaint}>
            THE WORD WAS
          </Text>
          <Text style={styles.word} center color={t.accentEnd} numberOfLines={2}>
            {data.word}
          </Text>
        </View>

        <View style={styles.villains}>
          {data.villains.map((v) => (
            <View
              key={v.name + v.role}
              style={[styles.villainChip, { borderColor: t.accent, backgroundColor: t.bgElev }]}
            >
              <Text style={styles.villainText} color={t.accent}>
                {v.name} · {v.role}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tally}>
          {data.tally.slice(0, 5).map((row) => (
            <View key={row.name} style={styles.tallyRow}>
              <Text
                style={styles.tallyName}
                color={row.villain ? t.accent : t.textDim}
                numberOfLines={1}
              >
                {row.name}
              </Text>
              <View style={[styles.track, { backgroundColor: t.bgElev }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: row.villain ? t.accent : t.textFaint,
                      width: `${Math.max(4, (row.count / maxVotes) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.tallyCount} color={t.textFaint}>
                {row.count}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: t.stroke }]}>
          <Text style={styles.brand}>🕵️ IMPOSTOR</Text>
          <Text style={styles.url} color={t.textDim}>
            imnb57.github.io/impostor
          </Text>
        </View>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    overflow: 'hidden',
  },
  inner: { flex: 1, padding: space.xxl, justifyContent: 'space-between' },
  header: { alignItems: 'center' },
  headerText: { fontFamily: 'Sora_600SemiBold', fontSize: 17, letterSpacing: 1.6 },
  verdict: { alignItems: 'center', gap: space.md },
  emoji: { fontSize: 84, lineHeight: 96 },
  headline: { fontFamily: 'Sora_800ExtraBold', fontSize: 42, lineHeight: 48, letterSpacing: -1.4 },
  detail: { fontFamily: 'Sora_400Regular', fontSize: 20, lineHeight: 28 },
  wordBox: {
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: space.lg,
    paddingHorizontal: space.base,
    alignItems: 'center',
    gap: space.xs,
  },
  wordLabel: { fontFamily: 'Sora_600SemiBold', fontSize: 15, letterSpacing: 2.4 },
  word: { fontFamily: 'Sora_800ExtraBold', fontSize: 46, lineHeight: 54, letterSpacing: -1.4 },
  villains: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'center' },
  villainChip: {
    borderWidth: 2,
    borderRadius: radius.pill,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
  },
  villainText: { fontFamily: 'Sora_700Bold', fontSize: 19 },
  tally: { gap: space.md },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tallyName: { fontFamily: 'Sora_600SemiBold', fontSize: 18, width: 130 },
  tallyCount: { fontFamily: 'Sora_600SemiBold', fontSize: 18, width: 26, textAlign: 'right' },
  track: { flex: 1, height: 12, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  footer: {
    borderTopWidth: 2,
    paddingTop: space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontFamily: 'Sora_800ExtraBold', fontSize: 22, letterSpacing: -0.4 },
  url: { fontFamily: 'Sora_600SemiBold', fontSize: 16 },
});
