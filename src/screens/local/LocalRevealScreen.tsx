import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { RoleCard } from '../../components/RoleCard';
import { Screen } from '../../components/Screen';
import { getCategory } from '../../constants/categories';
import { colors, font, spacing } from '../../constants/theme';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalRevealScreen({ navigation }: ScreenProps<'LocalReveal'>) {
  const players = useLocalGameStore((s) => s.players);
  const word = useLocalGameStore((s) => s.word);
  const categoryId = useLocalGameStore((s) => s.categoryId);
  const [index, setIndex] = useState(0);

  const player = players[index];
  if (!player) return <Screen>{null}</Screen>;

  const isLast = index === players.length - 1;

  return (
    <Screen>
      <Text style={styles.passLabel}>Pass the phone to</Text>
      <Text style={styles.playerName}>{player.name}</Text>

      {/* key resets the hold-to-reveal state for each player */}
      <RoleCard
        key={index}
        isImpostor={player.isImpostor}
        word={word}
        categoryName={getCategory(categoryId).name}
      />

      {isLast ? (
        <Button
          label="Everyone's ready — start discussion"
          onPress={() => navigation.replace('LocalDiscussion')}
        />
      ) : (
        <Button
          label={`Done — pass to ${players[index + 1].name}`}
          onPress={() => setIndex(index + 1)}
        />
      )}
      <Text style={styles.progress}>
        Player {index + 1} of {players.length}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  passLabel: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  playerName: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  progress: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
