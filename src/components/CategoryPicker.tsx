import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { colors, font, radius, spacing } from '../constants/theme';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({ selectedId, onSelect, disabled = false }: Props) {
  return (
    <View style={styles.wrap}>
      {CATEGORIES.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            disabled={disabled}
            style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {category.emoji} {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.textDim,
    fontSize: font.small,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
  },
});
