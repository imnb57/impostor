import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { CATEGORIES } from '../constants/categories';
import { motion, radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { Text } from './ui/Text';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({ selectedId, onSelect, disabled }: Props) {
  return (
    <View style={styles.wrap}>
      {CATEGORIES.map((category) => (
        <Chip
          key={category.id}
          label={`${category.emoji}  ${category.name}`}
          selected={category.id === selectedId}
          disabled={disabled}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
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
        scale.value = withSpring(0.94, motion.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.bouncy);
      }}
    >
      <Animated.View
        style={[
          styles.chip,
          animated,
          {
            backgroundColor: selected ? t.accent : t.surface,
            borderColor: selected ? t.accent : t.stroke,
          },
          disabled && styles.disabled,
        ]}
      >
        <Text variant="caption" color={selected ? t.onAccent : t.textDim}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
  },
  disabled: { opacity: 0.45 },
});
