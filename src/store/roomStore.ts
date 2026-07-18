import { create } from 'zustand';
import type { Room } from '../types';

// Mirrors the Firebase subscription — the room payload here is the render
// source for every online screen. No forked copies of room state.
interface RoomSessionState {
  roomCode: string | null;
  selfUid: string | null;
  room: Room | null;
  setSession: (roomCode: string, selfUid: string) => void;
  setRoom: (room: Room | null) => void;
  clearSession: () => void;
}

export const useRoomStore = create<RoomSessionState>((set) => ({
  roomCode: null,
  selfUid: null,
  room: null,
  setSession: (roomCode, selfUid) => set({ roomCode, selfUid, room: null }),
  setRoom: (room) => set({ room }),
  clearSession: () => set({ roomCode: null, selfUid: null, room: null }),
}));
