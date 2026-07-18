import { useEffect } from 'react';
import { subscribeRoom } from '../services/rooms';
import { useRoomStore } from '../store/roomStore';

/**
 * The single Firebase subscription driving every online screen.
 * Mount once per room session (in OnlineRoomScreen).
 */
export function useRoomSubscription(roomCode: string | null): void {
  const setRoom = useRoomStore((s) => s.setRoom);

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = subscribeRoom(roomCode, setRoom);
    return unsubscribe;
  }, [roomCode, setRoom]);
}
