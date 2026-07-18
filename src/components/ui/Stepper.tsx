import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion, radius, space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { Text } from './Text';

interface Props {
  label: string;
  hint?: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
}

export function Stepper({
  label,
  hint,
  value,
  onDecrement,
  onIncrement,
  minusDisabled,
  plusDisabled,
}: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.labels}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" faint>
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={[styles.controls, { backgroundColor: t.surface, borderColor: t.stroke }]}>
        <StepKey symbol="−" onPress={onDecrement} disabled={minusDisabled} />
        <Text variant="bodyStrong" style={styles.value}>
          {value}
        </Text>
        <StepKey symbol="+" onPress={onIncrement} disabled={plusDisabled} />
      </View>
    </View>
  );
}

function StepKey({
  symbol,
  onPress,
  disabled,
}: {
  symbol: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.85, motion.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.bouncy);
      }}
    >
      <Animated.View style={[styles.key, animated]}>
        <Text variant="heading" color={disabled ? t.textFaint : t.text}>
          {symbol}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
    paddingVertical: space.sm,
  },
  labels: { flexShrink: 1, gap: 2 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: space.xs,
  },
  key: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 62, textAlign: 'center' },
});
