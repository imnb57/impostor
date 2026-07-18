import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion, radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { Aurora } from './ui/Aurora';
import { Text } from './ui/Text';

interface Props {
  onDone: () => void;
}

/**
 * Brand moment on cold start: the role card lands, turns over, and the
 * wordmark resolves — the same gesture the game is built around.
 */
export function AnimatedSplash({ onDone }: Props) {
  const t = useTheme();

  const enter = useSharedValue(0);
  const flip = useSharedValue(0);
  const fade = useSharedValue(1);

  useEffect(() => {
    enter.value = withSpring(1, motion.spring.gentle);
    flip.value = withDelay(560, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
    const tick = setTimeout(() => haptics.reveal(), 620);

    fade.value = withDelay(
      1750,
      withTiming(0, { duration: 320 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    return () => clearTimeout(tick);
  }, [enter, flip, fade, onDone]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { perspective: 1200 },
      { translateY: interpolate(enter.value, [0, 1], [40, 0]) },
      { scale: interpolate(enter.value, [0, 1], [0.85, 1]) },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({ opacity: flip.value > 0.5 ? 0 : 1 }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value > 0.5 ? 1 : 0,
    transform: [{ rotateY: '180deg' }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: withDelay(900, withTiming(1, { duration: 420 })),
    transform: [
      { translateY: withDelay(900, withSequence(withTiming(10, { duration: 0 }), withSpring(0, motion.spring.gentle))) },
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: t.bg }, rootStyle]}>
      <Aurora />
      <View style={styles.center}>
        <Animated.View style={[styles.card, cardStyle, { borderColor: t.stroke, backgroundColor: t.surface }]}>
          <Animated.View style={[styles.face, frontStyle]}>
            <Text variant="display" color={t.textFaint}>
              ?
            </Text>
          </Animated.View>
          <Animated.View style={[styles.face, backStyle]}>
            <Text style={styles.emoji}>🕵️</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.wordmark, { opacity: 0 }, wordmarkStyle]}>
          <Text variant="title" center>
            IMPOSTOR
          </Text>
          <Text variant="caption" faint center>
            One of you is lying
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  card: {
    width: 132,
    height: 168,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, lineHeight: 64 },
  wordmark: { gap: space.xs, alignItems: 'center' },
});
