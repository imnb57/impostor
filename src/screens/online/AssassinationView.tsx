import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { VoteGrid } from '../../components/VoteGrid';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { submitAssassinGuess } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

/** Only impostors act here; everyone else watches the clock run out on them. */
export function AssassinationView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const t = useTheme();
  const players = Object.entries(room.players ?? {});
  const self = room.players?.[selfUid];
  const isImpostor = self?.role === 'impostor';
  const [selected, setSelected] = useState<string | null>(null);

  const suspects = players
    .filter(([, p]) => p.role !== 'impostor')
    .map(([uid, p]) => ({ id: uid, name: p.name }));

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

      {isImpostor ? (
        <Animated.View entering={FadeIn} style={styles.block}>
          <Text variant="body" dim center>
            You were caught — but someone was feeding the crew. Name the informant and you
            steal the round.
          </Text>
          <VoteGrid options={suspects} selectedId={selected} onSelect={setSelected} />
          <Button
            label="Take the shot"
            disabled={!selected}
            onPress={() => {
              if (!selected) return;
              haptics.warning();
              submitAssassinGuess(roomCode, selected).catch(() => {});
            }}
            silent
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.waiting}>
          <Text variant="body" center>
            The impostor was caught…
          </Text>
          <Text variant="body" dim center>
            but they get one shot at naming the informant.
          </Text>
          <Text variant="caption" faint center>
            Waiting for their guess…
          </Text>
        </Animated.View>
      )}

      <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: space.xs, marginTop: space.xl, marginBottom: space.xl },
  emoji: { fontSize: 52, lineHeight: 60 },
  block: { gap: space.lg },
  waiting: { gap: space.md, marginVertical: space.xxl },
});
