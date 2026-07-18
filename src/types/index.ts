export type GameStatus = 'lobby' | 'reveal' | 'discussion' | 'voting' | 'results';

export interface RoomPlayer {
  name: string;
  connected: boolean;
  isImpostor: boolean;
  hasVoted: boolean;
}

export interface Room {
  hostId: string;
  status: GameStatus;
  category: string;
  impostorCount: number;
  timerSeconds: number;
  word: string;
  /** The vague clue handed to the impostor. Empty in rooms made before hints. */
  hint?: string;
  createdAt: number;
  /** Absolute epoch ms when the discussion phase ends; set by host on phase start. */
  discussionEndsAt?: number;
  players?: Record<string, RoomPlayer>;
  /** voterUid -> votedForUid */
  votes?: Record<string, string>;
}

/**
 * A secret word plus the oblique clues an impostor can be given.
 * Hints must gesture at the word without ever naming it.
 */
export interface WordEntry {
  word: string;
  hints: string[];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  words: WordEntry[];
}

export interface VoteTally {
  counts: Record<string, number>;
  /** Ids with the highest vote count; more than one entry means a tie. */
  topTargets: string[];
  topCount: number;
}
