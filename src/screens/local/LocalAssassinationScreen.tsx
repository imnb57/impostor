import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { VoteGrid } from '../../components/VoteGrid';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

/**
 * The impostor was caught — but an informant was feeding the crew. One last
 * shot: name them correctly and the round flips.
 */
export function LocalAssassinationScreen({ navigation }: ScreenProps<'LocalAssassination'>) {
  const t = useTheme();
  const players = useLocalGameStore((s) => s.players);
  const setAssassinGuess = useLocalGameStore((s) => s.setAssassinGuess);

  const [handedOver, setHandedOver] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const impostorNames = players.filter((p) => p.role === 'impostor').map((p) => p.name);
  const suspects = players
    .map((p, i) => ({ id: String(i), name: p.name, role: p.role }))
    .filter((p) => p.role !== 'impostor');

  const confirm = () => {
    if (selected === null) return;
    haptics.warning();
    setAssassinGuess(Number(selected));
    navigation.replace('LocalResults');
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text style={styles.emoji}>🗡️</Text>
        <Text variant="label" dim uppercase center>
          Final act
        </Text>
        <Text variant="title" center color={t.accent}>
          Assassination
        </Text>
      </Animated.View>

      {!handedOver ? (
        <Animated.View entering={FadeIn} style={styles.block}>
          <Text variant="body" dim center>
            {impostorNames.join(' and ')} {impostorNames.length > 1 ? 'were' : 'was'} caught —
            but someone was feeding the crew information.
          </Text>
          <Text variant="body" center>
            Pass the phone back to {impostorNames.join(' and ')}.
          </Text>
          <Button
            label="We're ready"
            onPress={() => {
              haptics.press();
              setHandedOver(true);
            }}
            silent
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.block}>
          <Text variant="subheading" center>
            Who was the informant?
          </Text>
          <Text variant="caption" faint center>
            Name them correctly and you steal the round.
          </Text>
          <VoteGrid options={suspects} selectedId={selected} onSelect={setSelected} />
          <Button label="Take the shot" disabled={selected === null} onPress={confirm} silent />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: space.xs, marginTop: space.xl, marginBottom: space.xl },
  emoji: { fontSize: 52, lineHeight: 60 },
  block: { gap: space.lg },
});
