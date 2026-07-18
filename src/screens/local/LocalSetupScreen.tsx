import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { CategoryPicker } from '../../components/CategoryPicker';
import { PlayerList } from '../../components/PlayerList';
import { Screen } from '../../components/Screen';
import { Stepper } from '../../components/Stepper';
import { TextField } from '../../components/TextField';
import { colors, font, spacing } from '../../constants/theme';
import { maxImpostors } from '../../services/gameLogic';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export function LocalSetupScreen({ navigation }: ScreenProps<'LocalSetup'>) {
  const playerNames = useLocalGameStore((s) => s.playerNames);
  const categoryId = useLocalGameStore((s) => s.categoryId);
  const impostorCount = useLocalGameStore((s) => s.impostorCount);
  const timerSeconds = useLocalGameStore((s) => s.timerSeconds);
  const addPlayer = useLocalGameStore((s) => s.addPlayer);
  const removePlayer = useLocalGameStore((s) => s.removePlayer);
  const setCategoryId = useLocalGameStore((s) => s.setCategoryId);
  const setImpostorCount = useLocalGameStore((s) => s.setImpostorCount);
  const setTimerSeconds = useLocalGameStore((s) => s.setTimerSeconds);
  const startGame = useLocalGameStore((s) => s.startGame);

  const [nameDraft, setNameDraft] = useState('');

  const submitName = () => {
    const name = nameDraft.trim();
    if (!name || playerNames.length >= MAX_PLAYERS) return;
    addPlayer(name);
    setNameDraft('');
  };

  const impostorCap = maxImpostors(playerNames.length);
  const canStart = playerNames.length >= MIN_PLAYERS;

  return (
    <Screen scroll>
      <Text style={styles.heading}>Who's playing?</Text>
      <TextField
        value={nameDraft}
        onChangeText={setNameDraft}
        placeholder={`Add player ${playerNames.length + 1}`}
        maxLength={16}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={submitName}
        submitBehavior="submit"
      />
      <Button label="Add player" variant="secondary" onPress={submitName} />
      <PlayerList
        players={playerNames.map((name, i) => ({ id: String(i), name }))}
        onRemove={(id) => removePlayer(Number(id))}
      />
      {!canStart ? (
        <Text style={styles.hint}>Add at least {MIN_PLAYERS} players to start.</Text>
      ) : null}

      <Text style={styles.heading}>Category</Text>
      <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />

      <Text style={styles.heading}>Settings</Text>
      <Stepper
        label="Impostors"
        valueLabel={String(Math.min(impostorCount, impostorCap))}
        onDecrement={() => setImpostorCount(Math.max(1, impostorCount - 1))}
        onIncrement={() => setImpostorCount(Math.min(impostorCap, impostorCount + 1))}
        decrementDisabled={impostorCount <= 1}
        incrementDisabled={impostorCount >= impostorCap}
      />
      <Stepper
        label="Discussion timer"
        valueLabel={`${Math.round(timerSeconds / 60)} min`}
        onDecrement={() => setTimerSeconds(Math.max(60, timerSeconds - 60))}
        onIncrement={() => setTimerSeconds(Math.min(600, timerSeconds + 60))}
        decrementDisabled={timerSeconds <= 60}
        incrementDisabled={timerSeconds >= 600}
      />

      <Button
        label="Start game"
        disabled={!canStart}
        onPress={() => {
          startGame();
          navigation.replace('LocalReveal');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.small,
    marginVertical: spacing.sm,
  },
});
