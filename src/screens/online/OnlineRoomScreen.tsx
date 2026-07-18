import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { useTheme } from '../../design/useTheme';
import { useRoomSubscription } from '../../hooks/useRoomSubscription';
import { leaveRoom } from '../../services/rooms';
import { haptics } from '../../services/haptics';
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
 * the room's status field decides which phase view renders, so every device
 * moves together without any per-screen navigation.
 */
export function OnlineRoomScreen({ navigation, route }: ScreenProps<'OnlineRoom'>) {
  const { roomCode } = route.params;
  const t = useTheme();
  useRoomSubscription(roomCode);

  const room = useRoomStore((s) => s.room);
  const selfUid = useRoomStore((s) => s.selfUid);
  const clearSession = useRoomStore((s) => s.clearSession);
  const setLastRoomCode = useSettingsStore((s) => s.setLastRoomCode);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (room) setLoaded(true);
  }, [room]);

  // Room deleted (last player left) — bail out to home.
  useEffect(() => {
    if (loaded && room === null) {
      setLastRoomCode(null);
      clearSession();
      navigation.popToTop();
    }
  }, [room, loaded, clearSession, setLastRoomCode, navigation]);

  // A phase change is worth feeling.
  useEffect(() => {
    if (room?.status) haptics.tap();
  }, [room?.status]);

  const handleLeave = async () => {
    haptics.tap();
    try {
      if (selfUid) await leaveRoom(roomCode, selfUid, room);
    } catch {
      // Leaving must always work locally even if the write fails.
    }
    setLastRoomCode(null);
    clearSession();
    navigation.popToTop();
  };

  if (!room || !selfUid) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      </Screen>
    );
  }

  const phase = { room, roomCode, selfUid, onLeave: handleLeave };

  switch (room.status) {
    case 'lobby':
      return <LobbyView {...phase} />;
    case 'reveal':
      return <RoleRevealView {...phase} />;
    case 'discussion':
      return <DiscussionView {...phase} />;
    case 'voting':
      return <VotingView {...phase} />;
    case 'results':
      return <ResultsView {...phase} />;
  }
}
