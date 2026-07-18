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
import { Text } from './ui/Text';

interface Props {
  isImpostor: boolean;
  word: string;
  categoryName: string;
  /** Oblique clue shown only to impostors so they can bluff. */
  hint?: string;
}

/**
 * The signature interaction: press and hold to turn your card over.
 * Holding (rather than tapping) means a shoulder-surfer only ever sees
 * the back, and letting go instantly hides it again.
 */
export function RoleCard({ isImpostor, word, categoryName, hint }: Props) {
  const t = useTheme();
  const gradient = useGradient();
  const motionOn = useMotion();

  const flip = useSharedValue(0); // 0 = hidden, 1 = revealed
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!motionOn) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [motionOn, pulse]);

  const reveal = () => {
    haptics.reveal();
    flip.value = withSpring(1, motion.spring.gentle);
  };

  const hide = () => {
    flip.value = withSpring(0, motion.spring.gentle);
  };

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

  return (
    <Pressable onPressIn={reveal} onPressOut={hide} style={styles.wrap}>
      {/* face down */}
      <Animated.View
        style={[
          styles.face,
          frontStyle,
          { backgroundColor: t.surface, borderColor: t.stroke },
        ]}
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

      {/* face up */}
      <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
        {isImpostor ? (
          <View style={[styles.fill, { backgroundColor: t.bgElev, borderColor: t.accent }]}>
            <Text style={styles.emoji}>🤫</Text>
            <Text variant="title" center color={t.accent}>
              IMPOSTOR
            </Text>
            <Text variant="caption" dim center>
              Category: {categoryName}
            </Text>
            {hint ? (
              <View style={[styles.hintChip, { borderColor: t.stroke, backgroundColor: t.surface }]}>
                <Text variant="label" faint uppercase center>
                  Your only clue
                </Text>
                <Text variant="subheading" center color={t.accentEnd}>
                  {hint}
                </Text>
              </View>
            ) : null}
            <Text variant="caption" faint center style={styles.footnote}>
              Blend in. Don't get caught.
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={[gradient[2] + '26', gradient[1] + '1A', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, { backgroundColor: t.bgElev, borderColor: t.accentEnd }]}
          >
            <Text variant="label" dim uppercase>
              The secret word is
            </Text>
            <Text variant="display" center color={t.accentEnd} numberOfLines={2}>
              {word}
            </Text>
            <Text variant="caption" faint center style={styles.footnote}>
              Describe it — never say it.
            </Text>
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 0.86, maxHeight: 420 },
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
  hintChip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.sm,
    gap: 2,
    alignItems: 'center',
  },
  footnote: { marginTop: space.sm },
});
