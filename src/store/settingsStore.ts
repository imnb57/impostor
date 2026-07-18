import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PALETTE_ID } from '../design/palettes';

interface SettingsState {
  playerName: string;
  lastRoomCode: string | null;
  /** Which colour identity the app wears. */
  paletteId: string;
  hapticsEnabled: boolean;
  /** When false, decorative motion is dropped (ambience, flourishes). */
  motionEnabled: boolean;
  /** Onboarding is shown once, then never again. */
  onboardingDone: boolean;
  /** Defaults pre-filled into every new game setup. */
  defaultTimerSeconds: number;
  defaultImpostorCount: number;
  defaultCategoryId: string;

  setPlayerName: (name: string) => void;
  setLastRoomCode: (code: string | null) => void;
  setPaletteId: (id: string) => void;
  setHapticsEnabled: (on: boolean) => void;
  setMotionEnabled: (on: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setDefaults: (d: Partial<Pick<SettingsState,
    'defaultTimerSeconds' | 'defaultImpostorCount' | 'defaultCategoryId'>>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      playerName: '',
      lastRoomCode: null,
      paletteId: DEFAULT_PALETTE_ID,
      hapticsEnabled: true,
      motionEnabled: true,
      onboardingDone: false,
      defaultTimerSeconds: 180,
      defaultImpostorCount: 1,
      defaultCategoryId: 'food',

      setPlayerName: (playerName) => set({ playerName }),
      setLastRoomCode: (lastRoomCode) => set({ lastRoomCode }),
      setPaletteId: (paletteId) => set({ paletteId }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setMotionEnabled: (motionEnabled) => set({ motionEnabled }),
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
      setDefaults: (d) => set(d),
    }),
    {
      name: 'impostor-settings',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
