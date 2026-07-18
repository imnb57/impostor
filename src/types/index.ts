export type GameStatus =
  | 'lobby'
  | 'reveal'
  | 'discussion'
  | 'voting'
  /** Only reached when an informant is in play and the crew won the vote. */
  | 'assassination'
  | 'results';

/**
 * Modes pick which roles are dealt. Kept as a single choice rather than
 * independent toggles so the table always knows what game it is playing.
 */
export type GameMode = 'classic' | 'saboteur' | 'informant' | 'fragments';

export type RoleId = 'crew' | 'impostor' | 'saboteur' | 'informant';

/** What a single player is shown at reveal. Everything is optional because
 *  each role sees a different slice. */
export interface RolePayload {
  /** The real word — crew and the saboteur. */
  word?: string;
  /** Oblique clue — impostors. */
  hint?: string;
  /** One facet of the word — fragments mode. */
  fragment?: string;
  /** Display name of an impostor — the informant only. */
  knownImpostorName?: string;
}

export interface RoomPlayer {
  name: string;
  connected: boolean;
  role: RoleId;
  payload: RolePayload;
  hasVoted: boolean;
  /** Legacy flag kept so rooms created before roles still render. */
  isImpostor?: boolean;
}

export interface Room {
  hostId: string;
  status: GameStatus;
  mode: GameMode;
  category: string;
  /** Pack the current round resolved to — differs from category when 'random'. */
  roundCategory?: string;
  impostorCount: number;
  timerSeconds: number;
  word: string;
  hint?: string;
  createdAt: number;
  discussionEndsAt?: number;
  /** Uid the impostors accuse of being the informant. */
  assassinGuess?: string | null;
  players?: Record<string, RoomPlayer>;
  /** voterUid -> votedForUid */
  votes?: Record<string, string>;
}

/**
 * A secret word plus oblique clues. The clues double as the fragments dealt
 * out in fragments mode, so the bank never needs a second set of content.
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
  topTargets: string[];
  topCount: number;
}

/** Everything the results screen needs, produced by one pure function. */
export interface RoundOutcome {
  votedOutId: string | null;
  tie: boolean;
  /** Roles that won this round; a player checks whether their role is here. */
  winners: RoleId[];
  /** True when impostors correctly identified the informant. */
  assassinated: boolean;
  headline: string;
  detail: string;
}
