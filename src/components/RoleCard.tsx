import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion, radius, space } from '../design/tokens';
import { useGradient, useMotion, useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { ROLE_META } from '../services/roles';
import type { GameMode, RoleId, RolePayload } from '../types';
import { Text } from './ui/Text';

interface Props {
  role: RoleId;
  payload: RolePayload;
  categoryName: string;
  mode: GameMode;
}

/**
 * The signature interaction: press and hold to turn your card over.
 * Holding rather than tapping means a shoulder-surfer only ever sees the
 * back, and letting go hides it instantly.
 */
export function RoleCard({ role, payload, categoryName, mode }: Props) {
  const t = useTheme();
  const gradient = useGradient();
  const motionOn = useMotion();
  const meta = ROLE_META[role];

  const flip = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!motionOn) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [motionOn, pulse]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: flip.value > 0.5 ? 0 : 1,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: flip.value > 0.5 ? 1 : 0,
  }));

  const fingerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(pulse.value, [0, 1], [0, 8]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.75, 1]),
  }));

  const accent = meta.sinister ? t.accent : t.accentEnd;

  return (
    <Pressable
      onPressIn={() => {
        haptics.reveal();
        flip.value = withSpring(1, motion.spring.gentle);
      }}
      onPressOut={() => {
        flip.value = withSpring(0, motion.spring.gentle);
      }}
      style={styles.wrap}
    >
      <Animated.View
        style={[styles.face, frontStyle, { backgroundColor: t.surface, borderColor: t.stroke }]}
      >
        <Animated.View style={fingerStyle}>
          <Text style={styles.emoji}>👆</Text>
        </Animated.View>
        <Text variant="heading" center>
          Hold to reveal
        </Text>
        <Text variant="caption" faint center>
          Keep the screen away from{'\n'}the other players
        </Text>
      </Animated.View>

      <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
        <LinearGradient
          colors={[accent + '24', gradient[1] + '14', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { backgroundColor: t.bgElev, borderColor: accent }]}
        >
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <Text variant="title" center color={accent}>
            {meta.label}
          </Text>

          <RoleBody role={role} payload={payload} mode={mode} categoryName={categoryName} />

          <Text variant="caption" faint center style={styles.footnote}>
            {meta.tagline}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function RoleBody({
  role,
  payload,
  mode,
  categoryName,
}: {
  role: RoleId;
  payload: RolePayload;
  mode: GameMode;
  categoryName: string;
}) {
  const t = useTheme();

  // Fragments mode: everyone holds a piece, the impostor's just isn't real.
  if (mode === 'fragments' && payload.fragment) {
    return (
      <>
        <Text variant="label" dim uppercase center>
          {role === 'impostor' ? 'Your fake fragment' : 'Your fragment'}
        </Text>
        <Text variant="heading" center color={t.accentEnd}>
          {payload.fragment}
        </Text>
        <Text variant="caption" dim center>
          {role === 'impostor'
            ? 'The others hold real pieces of one word.'
            : 'Piece the word together — one player is faking.'}
        </Text>
      </>
    );
  }

  if (payload.word) {
    return (
      <>
        <Text variant="label" dim uppercase center>
          The secret word is
        </Text>
        <Text variant="display" center color={t.accentEnd} numberOfLines={2}>
          {payload.word}
        </Text>
      </>
    );
  }

  if (payload.knownImpostorName) {
    return (
      <>
        <Text variant="caption" dim center>
          You never learn the word. But you know this:
        </Text>
        <View style={[styles.chip, { borderColor: t.stroke, backgroundColor: t.surface }]}>
          <Text variant="heading" center color={t.accentEnd}>
            {payload.knownImpostorName}
          </Text>
          <Text variant="label" faint uppercase center>
            is an impostor
          </Text>
        </View>
        <Text variant="caption" dim center>
          Point too hard and they will name you.
        </Text>
      </>
    );
  }

  return (
    <>
      <Text variant="caption" dim center>
        Category: {categoryName}
      </Text>
      {payload.hint ? (
        <View style={[styles.chip, { borderColor: t.stroke, backgroundColor: t.surface }]}>
          <Text variant="label" faint uppercase center>
            Your only clue
          </Text>
          <Text variant="subheading" center color={t.accentEnd}>
            {payload.hint}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 0.86, maxHeight: 430 },
  face: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.xxl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.xl,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  faceBack: { padding: 0, borderWidth: 0 },
  fill: {
    flex: 1,
    width: '100%',
    borderRadius: radius.xxl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.xl,
  },
  emoji: { fontSize: 40, lineHeight: 46 },
  chip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.xs,
    gap: 2,
    alignItems: 'center',
  },
  footnote: { marginTop: space.sm },
});
