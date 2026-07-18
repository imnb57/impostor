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
  createdAt: number;
  /** Absolute epoch ms when the discussion phase ends; set by host on phase start. */
  discussionEndsAt?: number;
  players?: Record<string, RoomPlayer>;
  /** voterUid -> votedForUid */
  votes?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

export interface VoteTally {
  counts: Record<string, number>;
  /** Ids with the highest vote count; more than one entry means a tie. */
  topTargets: string[];
  topCount: number;
}
