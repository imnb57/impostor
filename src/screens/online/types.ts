import type { Room } from '../../types';

/** Props passed by OnlineRoomScreen to each phase view. */
export interface OnlinePhaseProps {
  room: Room;
  roomCode: string;
  selfUid: string;
  onLeave: () => void;
}
