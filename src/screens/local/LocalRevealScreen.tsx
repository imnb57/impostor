import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { RoleCard } from '../../components/RoleCard';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { getCategory } from '../../constants/categories';
import { radius, space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { haptics } from '../../services/haptics';
import { useLocalGameStore } from '../../store/localGameStore';
import type { ScreenProps } from '../../types/navigation';

export function LocalRevealScreen({ navigation }: ScreenProps<'LocalReveal'>) {
  const t = useTheme();
  const players = useLocalGameStore((s) => s.players);
  const mode = useLocalGameStore((s) => s.mode);
  const categoryId = useLocalGameStore((s) => s.categoryId);
  const [index, setIndex] = useState(0);

  const player = players[index];
  if (!player) return <Screen>{null}</Screen>;

  const isLast = index === players.length - 1;

  return (
    <Screen>
      <View style={styles.progress}>
        {players.map((p, i) => (
          <View
            key={p.name + i}
            style={[
              styles.pip,
              {
                backgroundColor: i < index ? t.accent : i === index ? t.text : t.stroke,
                width: i === index ? 26 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        key={index}
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOut.duration(140)}
        style={styles.body}
      >
        <View style={styles.handoff}>
          <Text variant="caption" faint center uppercase>
            Pass the phone to
          </Text>
          <Text variant="title" center>
            {player.name}
          </Text>
        </View>

        <RoleCard
          key={index}
          role={player.role}
          payload={player.payload}
          mode={mode}
          categoryName={getCategory(categoryId).name}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(300)}>
        <Button
          label={isLast ? 'Everyone ready — start' : `Done — pass to ${players[index + 1].name}`}
          onPress={() => {
            if (isLast) {
              haptics.success();
              navigation.replace('LocalDiscussion');
            } else {
              haptics.press();
              setIndex(index + 1);
            }
          }}
          silent
        />
        <Text variant="caption" faint center style={styles.count}>
          Player {index + 1} of {players.length}
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    gap: space.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: space.sm,
  },
  pip: { height: 8, borderRadius: radius.pill },
  body: { flex: 1, justifyContent: 'center', gap: space.lg },
  handoff: { gap: space.xs },
  count: { marginTop: space.md },
});
