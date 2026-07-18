import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { colors } from '../../constants/theme';
import { useRoomSubscription } from '../../hooks/useRoomSubscription';
import { leaveRoom } from '../../services/rooms';
import { useRoomStore } from '../../store/roomStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { ScreenProps } from '../../types/navigation';
import { DiscussionView } from './DiscussionView';
import { LobbyView } from './LobbyView';
import { ResultsView } from './ResultsView';
import { RoleRevealView } from './RoleRevealView';
import { VotingView } from './VotingView';

/**
 * Container for the whole online game. One Firebase subscription drives it;
 * the room's status field decides which phase view renders. No per-phase
 * navigation, so all devices stay in sync automatically.
 */
export function OnlineRoomScreen({ navigation, route }: ScreenProps<'OnlineRoom'>) {
  const { roomCode } = route.params;
  useRoomSubscription(roomCode);

  const room = useRoomStore((s) => s.room);
  const selfUid = useRoomStore((s) => s.selfUid);
  const clearSession = useRoomStore((s) => s.clearSession);
  const setLastRoomCode = useSettingsStore((s) => s.setLastRoomCode);

  const [roomLoaded, setRoomLoaded] = useState(false);
  useEffect(() => {
    if (room) setRoomLoaded(true);
  }, [room]);

  // Room deleted (last player left) — return home.
  useEffect(() => {
    if (roomLoaded && room === null) {
      setLastRoomCode(null);
      clearSession();
      navigation.popToTop();
    }
  }, [room, roomLoaded, clearSession, setLastRoomCode, navigation]);

  const handleLeave = async () => {
    try {
      if (selfUid) await leaveRoom(roomCode, selfUid, room);
    } catch {
      // Leaving must always succeed locally even if the write fails.
    }
    setLastRoomCode(null);
    clearSession();
    navigation.popToTop();
  };

  if (!room || !selfUid) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </Screen>
    );
  }

  const phaseProps = { room, roomCode, selfUid, onLeave: handleLeave };

  switch (room.status) {
    case 'lobby':
      return <LobbyView {...phaseProps} />;
    case 'reveal':
      return <RoleRevealView {...phaseProps} />;
    case 'discussion':
      return <DiscussionView {...phaseProps} />;
    case 'voting':
      return <VotingView {...phaseProps} />;
    case 'results':
      return <ResultsView {...phaseProps} />;
  }
}
