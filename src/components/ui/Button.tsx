import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion, radius, shadow, space } from '../../design/tokens';
import { useActionGradient, useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { Text } from './Text';

type Variant = 'primary' | 'glass' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  /** Emoji or icon rendered before the label. */
  icon?: ReactNode;
  style?: ViewStyle;
  /** Skip the haptic — used when the caller fires its own richer feedback. */
  silent?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  icon,
  style,
  silent,
}: Props) {
  const t = useTheme();
  const gradient = useActionGradient();
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const press = () => {
    if (!silent) haptics.press();
    onPress();
  };

  const height = size === 'lg' ? 58 : 48;
  // A disabled button drops the gradient entirely rather than fading it — a
  // dimmed gradient washes the label out instead of reading as unavailable.
  const isPrimary = variant === 'primary' && !disabled;

  const labelColor = disabled
    ? t.textFaint
    : isPrimary
      ? t.onAccent
      : variant === 'danger'
        ? t.danger
        : t.text;

  const body = (
    <>
      {icon}
      <Text variant="bodyStrong" color={labelColor}>
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={press}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, motion.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.bouncy);
      }}
      style={style}
    >
      <Animated.View style={animated}>
        {isPrimary ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.base,
              { height, borderRadius: radius.lg },
              shadow.glow,
              { shadowColor: t.accent },
            ]}
          >
            {body}
          </LinearGradient>
        ) : (
          <Animated.View
            style={[
              styles.base,
              {
                height,
                borderRadius: radius.lg,
                // Disabled gets its own treatment — borderless and barely
                // filled. Without this it renders exactly like an enabled
                // glass button, so "not yet" reads as "tap me".
                backgroundColor: disabled
                  ? t.surface
                  : variant === 'ghost'
                    ? 'transparent'
                    : t.surface,
                borderWidth: disabled || variant === 'ghost' ? 0 : 1,
                borderColor: variant === 'danger' ? t.danger : t.stroke,
                opacity: disabled ? 0.75 : 1,
              },
            ]}
          >
            {body}
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  disabled: { opacity: 0.4 },
});
