import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  playerName: string;
  lastRoomCode: string | null;
  setPlayerName: (name: string) => void;
  setLastRoomCode: (code: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      playerName: '',
      lastRoomCode: null,
      setPlayerName: (playerName) => set({ playerName }),
      setLastRoomCode: (lastRoomCode) => set({ lastRoomCode }),
    }),
    {
      name: 'impostor-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
