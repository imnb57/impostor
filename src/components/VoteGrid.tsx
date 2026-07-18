import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { Card } from './ui/Card';
import { Text } from './ui/Text';

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
  const t = useTheme();

  return (
    <View style={styles.grid}>
      {options.map((option, i) => {
        const selected = option.id === selectedId;
        return (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay(i * 50).springify().damping(18)}
            style={styles.cell}
          >
            <Card active={selected} onPress={() => onSelect(option.id)} style={styles.card}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: selected ? t.accent : t.surfacePressed,
                    borderColor: selected ? t.accent : t.stroke,
                  },
                ]}
              >
                <Text variant="bodyStrong" color={selected ? t.onAccent : t.textDim}>
                  {option.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text variant="bodyStrong" center numberOfLines={1}>
                {option.name}
              </Text>
            </Card>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { flexBasis: '47.5%', flexGrow: 1 },
  card: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
