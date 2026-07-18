import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';

interface Props {
  isImpostor: boolean;
  word: string;
  categoryName: string;
}

/** Press-and-hold card so roles can be checked without neighbors seeing. */
export function RoleCard({ isImpostor, word, categoryName }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setRevealed(true)}
      onPressOut={() => setRevealed(false)}
      style={[styles.card, revealed && (isImpostor ? styles.cardImpostor : styles.cardCrew)]}
    >
      {revealed ? (
        isImpostor ? (
          <>
            <Text style={styles.roleTitle}>🤫 You are the IMPOSTOR</Text>
            <Text style={styles.roleSubtitle}>Category: {categoryName}</Text>
            <Text style={styles.roleHint}>Blend in. Don't get caught.</Text>
          </>
        ) : (
          <>
            <Text style={styles.roleSubtitle}>The secret word is</Text>
            <Text style={styles.word}>{word}</Text>
            <Text style={styles.roleHint}>Describe it — never say it.</Text>
          </>
        )
      ) : (
        <>
          <Text style={styles.holdIcon}>👆</Text>
          <Text style={styles.holdText}>Hold to reveal your role</Text>
          <Text style={styles.roleHint}>Keep the screen away from other players</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    marginVertical: spacing.lg,
  },
  cardImpostor: {
    borderColor: colors.accent,
    backgroundColor: '#2A1420',
  },
  cardCrew: {
    borderColor: colors.secondary,
    backgroundColor: '#10222E',
  },
  holdIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  holdText: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleTitle: {
    color: colors.accent,
    fontSize: font.heading,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  roleSubtitle: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
  },
  word: {
    color: colors.secondary,
    fontSize: font.giant,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  roleHint: {
    color: colors.textDim,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
