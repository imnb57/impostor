import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CategoryPicker } from '../../components/CategoryPicker';
import { ModePicker } from '../../components/ModePicker';
import { PlayerList } from '../../components/PlayerList';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Stepper } from '../../components/ui/Stepper';
import { Text } from '../../components/ui/Text';
import { TextField } from '../../components/ui/TextField';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { maxImpostors } from '../../services/gameLogic';
import { haptics } from '../../services/haptics';
import { useLocalGameStore } from '../../store/localGameStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { ScreenProps } from '../../types/navigation';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export function LocalSetupScreen({ navigation }: ScreenProps<'LocalSetup'>) {
  const t = useTheme();
  const game = useLocalGameStore();
  const defaults = useSettingsStore();
  const [draft, setDraft] = useState('');

  // Seed a fresh setup from the player's saved defaults.
  useEffect(() => {
    if (game.playerNames.length === 0) {
      game.setCategoryId(defaults.defaultCategoryId);
      game.setImpostorCount(defaults.defaultImpostorCount);
      game.setTimerSeconds(defaults.defaultTimerSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    const name = draft.trim();
    if (!name || game.playerNames.length >= MAX_PLAYERS) return;
    haptics.tap();
    game.addPlayer(name);
    setDraft('');
  };

  const cap = maxImpostors(game.playerNames.length);
  const canStart = game.playerNames.length >= MIN_PLAYERS;

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="title">Who's playing?</Text>
        <Text variant="caption" faint>
          {game.playerNames.length} of {MAX_PLAYERS} · at least {MIN_PLAYERS} to start
        </Text>
      </Animated.View>

      <View style={styles.addRow}>
        <View style={styles.addField}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder={`Player ${game.playerNames.length + 1}`}
            maxLength={16}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={submit}
            submitBehavior="submit"
          />
        </View>
        <Button label="Add" size="md" onPress={submit} style={styles.addBtn} silent />
      </View>

      <View style={styles.list}>
        <PlayerList
          players={game.playerNames.map((name, i) => ({ id: String(i), name }))}
          onRemove={(id) => game.removePlayer(Number(id))}
        />
      </View>

      <Text variant="label" dim uppercase style={styles.sectionLabel}>
        Mode
      </Text>
      <ModePicker
        selected={game.mode}
        playerCount={game.playerNames.length}
        onSelect={game.setMode}
      />

      <Text variant="label" dim uppercase style={styles.sectionLabel}>
        Category
      </Text>
      <CategoryPicker selectedId={game.categoryId} onSelect={game.setCategoryId} />

      <Text variant="label" dim uppercase style={styles.sectionLabel}>
        Round
      </Text>
      <Card>
        <Stepper
          label="Impostors"
          hint={`Up to ${cap} with this group`}
          value={String(Math.min(game.impostorCount, cap))}
          onDecrement={() => game.setImpostorCount(Math.max(1, game.impostorCount - 1))}
          onIncrement={() => game.setImpostorCount(Math.min(cap, game.impostorCount + 1))}
          minusDisabled={game.impostorCount <= 1}
          plusDisabled={game.impostorCount >= cap}
        />
        <View style={[styles.divider, { backgroundColor: t.stroke }]} />
        <Stepper
          label="Discussion"
          value={`${Math.round(game.timerSeconds / 60)} min`}
          onDecrement={() => game.setTimerSeconds(Math.max(60, game.timerSeconds - 60))}
          onIncrement={() => game.setTimerSeconds(Math.min(600, game.timerSeconds + 60))}
          minusDisabled={game.timerSeconds <= 60}
          plusDisabled={game.timerSeconds >= 600}
        />
      </Card>

      <Button
        label={canStart ? 'Start game' : `Add ${MIN_PLAYERS - game.playerNames.length} more`}
        disabled={!canStart}
        onPress={() => {
          haptics.success();
          game.startGame();
          navigation.replace('LocalReveal');
        }}
        style={styles.start}
        silent
      />
      <Button label="Back" variant="ghost" size="md" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.lg, gap: space.xs },
  addRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  addField: { flex: 1 },
  addBtn: { width: 88 },
  list: { marginTop: space.base },
  sectionLabel: { marginTop: space.xl, marginBottom: space.md },
  divider: { height: 1, marginVertical: space.sm },
  start: { marginTop: space.xl },
});
