import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { motion, radius, space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { Text } from './Text';

interface Props {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

export function Toggle({ label, hint, value, onChange }: Props) {
  const t = useTheme();

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? 22 : 0, motion.spring.snappy) }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onChange(!value);
      }}
      style={styles.row}
    >
      <View style={styles.labels}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" faint>
            {hint}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? t.accent : t.surface,
            borderColor: value ? t.accent : t.stroke,
          },
        ]}
      >
        <Animated.View
          style={[styles.knob, knob, { backgroundColor: value ? t.onAccent : t.textFaint }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
    paddingVertical: space.md,
  },
  labels: { flexShrink: 1, gap: 2 },
  track: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'center',
  },
  knob: { width: 22, height: 22, borderRadius: radius.pill },
});
