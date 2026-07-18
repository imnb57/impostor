import { create } from 'zustand';
import { CATEGORIES } from '../constants/categories';
import { maxImpostors, pickRound } from '../services/gameLogic';
import { resolveRound, type ResolvablePlayer } from '../services/resolveRound';
import { assignRoles, buildPayloads } from '../services/roles';
import type { GameMode, RoleId, RolePayload, RoundOutcome } from '../types';

export interface LocalPlayer {
  name: string;
  role: RoleId;
  payload: RolePayload;
}

interface LocalGameState {
  playerNames: string[];
  mode: GameMode;
  categoryId: string;
  impostorCount: number;
  timerSeconds: number;
  players: LocalPlayer[];
  word: string;
  /** Pack the round resolved to — 'random' picks a new one each game. */
  roundCategoryId: string;
  /** voter index -> target index */
  votes: Record<number, number>;
  /** Index the impostors accuse of being the informant. */
  assassinGuess: number | null;

  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  setMode: (mode: GameMode) => void;
  setCategoryId: (id: string) => void;
  setImpostorCount: (n: number) => void;
  setTimerSeconds: (s: number) => void;
  startGame: () => void;
  castVote: (voter: number, target: number) => void;
  setAssassinGuess: (index: number) => void;
  resetRound: () => void;
}

/** Adapts the index-keyed local game onto the shared resolver. */
export function localResolvables(players: LocalPlayer[]): ResolvablePlayer[] {
  return players.map((p, i) => ({ id: String(i), name: p.name, role: p.role }));
}

export function localOutcome(state: {
  players: LocalPlayer[];
  votes: Record<number, number>;
  assassinGuess: number | null;
}): RoundOutcome {
  const votes: Record<string, string> = {};
  for (const [voter, target] of Object.entries(state.votes)) votes[voter] = String(target);
  return resolveRound({
    players: localResolvables(state.players),
    votes,
    assassinGuess: state.assassinGuess === null ? null : String(state.assassinGuess),
  });
}

export const useLocalGameStore = create<LocalGameState>((set, get) => ({
  playerNames: [],
  mode: 'classic',
  categoryId: CATEGORIES[0].id,
  impostorCount: 1,
  timerSeconds: 180,
  players: [],
  word: '',
  roundCategoryId: CATEGORIES[0].id,
  votes: {},
  assassinGuess: null,

  addPlayer: (name) => set((s) => ({ playerNames: [...s.playerNames, name] })),
  removePlayer: (index) =>
    set((s) => {
      const playerNames = s.playerNames.filter((_, i) => i !== index);
      return {
        playerNames,
        impostorCount: Math.min(s.impostorCount, maxImpostors(playerNames.length)),
      };
    }),
  setMode: (mode) => set({ mode }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setImpostorCount: (impostorCount) => set({ impostorCount }),
  setTimerSeconds: (timerSeconds) => set({ timerSeconds }),

  startGame: () => {
    const { playerNames, impostorCount, categoryId, mode } = get();
    const ids = playerNames.map((_, i) => String(i));
    const namesById = Object.fromEntries(playerNames.map((n, i) => [String(i), n]));
    const seed = pickRound(categoryId);
    const roles = assignRoles(mode, ids, impostorCount);
    const payloads = buildPayloads(mode, roles, seed, namesById);

    set({
      players: playerNames.map((name, i) => ({
        name,
        role: roles[String(i)],
        payload: payloads[String(i)] ?? {},
      })),
      word: seed.word,
      roundCategoryId: seed.categoryId,
      votes: {},
      assassinGuess: null,
    });
  },

  castVote: (voter, target) => set((s) => ({ votes: { ...s.votes, [voter]: target } })),
  setAssassinGuess: (index) => set({ assassinGuess: index }),
  resetRound: () => set({ players: [], word: '', votes: {}, assassinGuess: null }),
}));
