import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';

export interface VoteOption {
  id: string;
  name: string;
}

interface Props {
  options: VoteOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function VoteGrid({ options, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[styles.cell, selected && styles.cellSelected]}
          >
            <Text style={[styles.cellText, selected && styles.cellTextSelected]} numberOfLines={1}>
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  cell: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  cellSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  cellText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  cellTextSelected: {
    color: colors.text,
  },
});
