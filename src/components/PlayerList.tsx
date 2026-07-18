import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { Text } from './ui/Text';

export interface PlayerListItem {
  id: string;
  name: string;
  badge?: string;
  dimmed?: boolean;
}

interface Props {
  players: PlayerListItem[];
  onRemove?: (id: string) => void;
}

export function PlayerList({ players, onRemove }: Props) {
  const t = useTheme();

  return (
    <View style={styles.list}>
      {players.map((player, i) => (
        <Animated.View
          key={player.id}
          entering={FadeInDown.delay(i * 45).springify().damping(18)}
          exiting={FadeOut.duration(160)}
          layout={Layout.springify().damping(20)}
          style={[styles.row, { backgroundColor: t.surface, borderColor: t.stroke }]}
        >
          <View style={[styles.avatar, { backgroundColor: t.surfacePressed, borderColor: t.stroke }]}>
            <Text variant="bodyStrong" color={t.textDim}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.names}>
            <Text variant="bodyStrong" dim={player.dimmed} numberOfLines={1}>
              {player.name}
            </Text>
            {player.badge ? (
              <Text variant="caption" faint>
                {player.badge}
              </Text>
            ) : null}
          </View>
          {onRemove ? (
            <Pressable
              hitSlop={10}
              onPress={() => {
                haptics.tap();
                onRemove(player.id);
              }}
            >
              <Text variant="bodyStrong" color={t.textFaint}>
                ✕
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: { flex: 1, gap: 1 },
});
