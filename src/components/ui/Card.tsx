import type { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion, radius, space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Highlights the card with the accent colour (selected state). */
  active?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

/** The app's one surface treatment: translucent glass with a hairline edge. */
export function Card({ children, onPress, active, padded = true, style }: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const surface: ViewStyle = {
    backgroundColor: active ? t.surfacePressed : t.surface,
    borderColor: active ? t.accent : t.stroke,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: padded ? space.lg : 0,
  };

  if (!onPress) {
    return <Animated.View style={[surface, style]}>{children}</Animated.View>;
  }

  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.975, motion.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.bouncy);
      }}
    >
      <Animated.View style={[surface, animated, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export const cardStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
