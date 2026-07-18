import { StyleSheet, View } from 'react-native';
import { space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { MODES } from '../services/roles';
import type { GameMode } from '../types';
import { Card } from './ui/Card';
import { Text } from './ui/Text';

interface Props {
  selected: GameMode;
  playerCount: number;
  onSelect: (mode: GameMode) => void;
  disabled?: boolean;
}

/** Mode is a single choice so the whole table knows what game it is playing. */
export function ModePicker({ selected, playerCount, onSelect, disabled }: Props) {
  const t = useTheme();

  return (
    <View style={styles.list}>
      {MODES.map((mode) => {
        const locked = playerCount > 0 && playerCount < mode.minPlayers;
        const active = mode.id === selected;
        return (
          <Card
            key={mode.id}
            active={active}
            onPress={disabled || locked ? undefined : () => onSelect(mode.id)}
            style={styles.card}
          >
            <View style={styles.row}>
              <Text style={[styles.emoji, locked && styles.lockedEmoji]}>{mode.emoji}</Text>
              <View style={styles.text}>
                <Text variant="bodyStrong" color={active ? t.accent : locked ? t.textDim : t.text}>
                  {mode.name}
                </Text>
                <Text variant="caption" faint>
                  {locked ? `Needs ${mode.minPlayers}+ players` : mode.blurb}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm },
  card: { paddingVertical: space.base },
  lockedEmoji: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  emoji: { fontSize: 26, lineHeight: 32 },
  text: { flex: 1, gap: 1 },
});
