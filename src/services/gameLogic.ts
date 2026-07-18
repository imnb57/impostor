import { getCategory } from '../constants/categories';
import type { VoteTally } from '../types';

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick `count` distinct random items from `items`. */
export function sample<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

/** Everything a round needs from the word bank, chosen once up front. */
export interface RoundSeed {
  word: string;
  /** All facets of the word — dealt out in fragments mode. */
  hints: string[];
  /** The single clue an impostor is shown in the other modes. */
  impostorHint: string;
  /** A facet borrowed from a different word, for the impostor in fragments mode. */
  decoyFragment: string;
}

export function pickRound(categoryId: string): RoundSeed {
  const category = getCategory(categoryId);
  const entry = pickRandom(category.words);
  const others = category.words.filter((w) => w.word !== entry.word);
  const decoySource = others.length ? pickRandom(others) : entry;

  return {
    word: entry.word,
    hints: entry.hints.length ? entry.hints : [category.name],
    impostorHint: entry.hints.length ? pickRandom(entry.hints) : category.name,
    decoyFragment: decoySource.hints.length ? pickRandom(decoySource.hints) : category.name,
  };
}

export function tallyVotes(votes: Record<string, string>): VoteTally {
  const counts: Record<string, number> = {};
  for (const target of Object.values(votes)) {
    counts[target] = (counts[target] ?? 0) + 1;
  }
  let topCount = 0;
  for (const n of Object.values(counts)) {
    if (n > topCount) topCount = n;
  }
  const topTargets = Object.keys(counts).filter((id) => counts[id] === topCount);
  return { counts, topTargets, topCount };
}

// No O/0 or I/1 so codes are easy to read out loud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 4): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Impostors must stay a strict minority. */
export function maxImpostors(playerCount: number): number {
  return Math.max(1, Math.ceil(playerCount / 2) - 1);
}
