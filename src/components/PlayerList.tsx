import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';

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
  return (
    <View style={styles.list}>
      {players.map((player) => (
        <View key={player.id} style={styles.row}>
          <Text style={[styles.name, player.dimmed && styles.dimmed]} numberOfLines={1}>
            {player.name}
          </Text>
          {player.badge ? <Text style={styles.badge}>{player.badge}</Text> : null}
          {onRemove ? (
            <Pressable onPress={() => onRemove(player.id)} style={styles.remove}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
    flex: 1,
  },
  dimmed: {
    color: colors.textDim,
  },
  badge: {
    color: colors.textDim,
    fontSize: font.small,
    marginLeft: spacing.sm,
  },
  remove: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  removeText: {
    color: colors.danger,
    fontSize: font.body,
  },
});
