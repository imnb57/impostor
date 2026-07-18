import { create } from 'zustand';
import { CATEGORIES } from '../constants/categories';
import { maxImpostors, pickWord, sample } from '../services/gameLogic';

export interface LocalPlayer {
  name: string;
  isImpostor: boolean;
}

interface LocalGameState {
  playerNames: string[];
  categoryId: string;
  impostorCount: number;
  timerSeconds: number;
  players: LocalPlayer[];
  word: string;
  /** voter index -> target index */
  votes: Record<number, number>;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  setCategoryId: (id: string) => void;
  setImpostorCount: (n: number) => void;
  setTimerSeconds: (s: number) => void;
  startGame: () => void;
  castVote: (voter: number, target: number) => void;
  resetRound: () => void;
}

export const useLocalGameStore = create<LocalGameState>((set, get) => ({
  playerNames: [],
  categoryId: CATEGORIES[0].id,
  impostorCount: 1,
  timerSeconds: 180,
  players: [],
  word: '',
  votes: {},
  addPlayer: (name) =>
    set((s) => ({ playerNames: [...s.playerNames, name] })),
  removePlayer: (index) =>
    set((s) => {
      const playerNames = s.playerNames.filter((_, i) => i !== index);
      return {
        playerNames,
        impostorCount: Math.min(s.impostorCount, maxImpostors(playerNames.length)),
      };
    }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setImpostorCount: (impostorCount) => set({ impostorCount }),
  setTimerSeconds: (timerSeconds) => set({ timerSeconds }),
  startGame: () => {
    const { playerNames, impostorCount, categoryId } = get();
    const capped = Math.min(impostorCount, maxImpostors(playerNames.length));
    const impostorIndexes = new Set(
      sample(playerNames.map((_, i) => i), capped),
    );
    set({
      players: playerNames.map((name, i) => ({
        name,
        isImpostor: impostorIndexes.has(i),
      })),
      word: pickWord(categoryId),
      votes: {},
    });
  },
  castVote: (voter, target) =>
    set((s) => ({ votes: { ...s.votes, [voter]: target } })),
  resetRound: () => set({ players: [], word: '', votes: {} }),
}));
