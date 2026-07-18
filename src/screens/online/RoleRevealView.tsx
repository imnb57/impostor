import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { RoleCard } from '../../components/RoleCard';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { getCategory } from '../../constants/categories';
import { space } from '../../design/tokens';
import { haptics } from '../../services/haptics';
import { beginDiscussion } from '../../services/rooms';
import type { OnlinePhaseProps } from './types';

export function RoleRevealView({ room, roomCode, selfUid, onLeave }: OnlinePhaseProps) {
  const isHost = room.hostId === selfUid;
  const self = room.players?.[selfUid];
  // Rooms started by a pre-roles client only carry the legacy flag.
  const role = self?.role ?? (self?.isImpostor ? 'impostor' : 'crew');
  const payload = self?.payload ?? (self?.isImpostor ? { hint: room.hint } : { word: room.word });

  return (
    <Screen>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="label" dim uppercase center>
          Your role
        </Text>
      </Animated.View>

      <View style={styles.body}>
        <RoleCard
          role={role}
          payload={payload}
          mode={room.mode ?? 'classic'}
          categoryName={getCategory(room.roundCategory ?? room.category).name}
        />
      </View>

      <Animated.View entering={FadeIn.delay(300)} style={styles.footer}>
        {isHost ? (
          <Button
            label="Everyone ready — start discussion"
            onPress={() => {
              haptics.success();
              beginDiscussion(roomCode, room.timerSeconds).catch(() => {});
            }}
            silent
          />
        ) : (
          <Text variant="caption" dim center>
            Waiting for the host to start the discussion…
          </Text>
        )}
        <Button label="Leave room" variant="ghost" size="md" onPress={onLeave} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.sm },
  body: { flex: 1, justifyContent: 'center' },
  footer: { gap: space.xs },
});
