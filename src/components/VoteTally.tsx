import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { Text } from './ui/Text';

export interface TallyRow {
  id: string;
  name: string;
  count: number;
  /** Marks the row as an impostor once roles are public. */
  highlight?: boolean;
}

interface Props {
  rows: TallyRow[];
  total: number;
}

/** Horizontal bars showing where the votes landed. */
export function VoteTally({ rows, total }: Props) {
  const t = useTheme();
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <View style={styles.wrap}>
      <Text variant="label" dim uppercase>
        Votes
      </Text>
      {sorted.map((row, i) => (
        <Animated.View
          key={row.id}
          entering={FadeInDown.delay(i * 60).springify().damping(18)}
          style={styles.row}
        >
          <View style={styles.labelRow}>
            <Text variant="caption" color={row.highlight ? t.accent : t.text}>
              {row.name}
              {row.highlight ? '  🕵️' : ''}
            </Text>
            <Text variant="caption" faint>
              {row.count}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: t.surface }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: row.highlight ? t.accent : t.textFaint,
                  width: `${(row.count / max) * 100}%`,
                },
              ]}
            />
          </View>
        </Animated.View>
      ))}
      <Text variant="caption" faint>
        {total} {total === 1 ? 'vote' : 'votes'} cast
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.xxl, gap: space.md },
  row: { gap: space.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
