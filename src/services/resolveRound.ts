import type { RoleId, RoundOutcome } from '../types';
import { tallyVotes } from './gameLogic';

export interface ResolvablePlayer {
  id: string;
  name: string;
  role: RoleId;
}

export interface ResolveInput {
  players: ResolvablePlayer[];
  /** voterId -> targetId */
  votes: Record<string, string>;
  /** Who the impostors accused of being the informant, if that phase ran. */
  assassinGuess?: string | null;
}

const INNOCENT: RoleId[] = ['crew', 'informant'];

/**
 * The single source of truth for who won. Pure and total: no dates, no
 * randomness, no I/O — every branch below is covered by resolveRound.test.ts.
 *
 * Shape of the rules:
 *  - Voting out an impostor is a win for the innocent side…
 *  - …unless the impostors then correctly assassinate the informant.
 *  - Voting out anyone else means the impostors survive.
 *  - The saboteur wins only by getting an *innocent* voted out.
 */
export function resolveRound({ players, votes, assassinGuess }: ResolveInput): RoundOutcome {
  const byId = new Map(players.map((p) => [p.id, p]));
  const tally = tallyVotes(votes);
  const tie = tally.topTargets.length !== 1;
  const votedOutId = tie ? null : tally.topTargets[0];
  const votedOut = votedOutId ? byId.get(votedOutId) : undefined;

  const hasSaboteur = players.some((p) => p.role === 'saboteur');
  const informant = players.find((p) => p.role === 'informant');

  // Nobody was ejected — the impostors simply survive.
  if (!votedOut) {
    return {
      votedOutId: null,
      tie: true,
      winners: ['impostor'],
      assassinated: false,
      headline: 'Nobody was voted out',
      detail: 'The vote was tied, so the impostor walks free.',
    };
  }

  if (votedOut.role === 'impostor') {
    const assassinated = Boolean(informant && assassinGuess && assassinGuess === informant.id);
    if (assassinated) {
      return {
        votedOutId,
        tie: false,
        winners: ['impostor'],
        assassinated: true,
        headline: 'The informant was assassinated',
        detail: `${votedOut.name} was caught — but named ${informant?.name} on the way out.`,
      };
    }
    return {
      votedOutId,
      tie: false,
      winners: INNOCENT,
      assassinated: false,
      headline: 'Impostor caught!',
      detail: `${votedOut.name} was the impostor.`,
    };
  }

  // An innocent went home: the impostors survive, and a saboteur got their wish.
  if (votedOut.role === 'saboteur') {
    return {
      votedOutId,
      tie: false,
      winners: ['impostor'],
      assassinated: false,
      headline: 'The saboteur was caught',
      detail: `${votedOut.name} was sabotaging the vote — but the impostor is still out there.`,
    };
  }

  return {
    votedOutId,
    tie: false,
    winners: hasSaboteur ? ['impostor', 'saboteur'] : ['impostor'],
    assassinated: false,
    headline: hasSaboteur ? 'The saboteur pulled it off' : 'The impostor got away',
    detail: `${votedOut.name} was innocent.`,
  };
}

/** Whether the assassination phase should run after the vote. */
export function needsAssassination(
  players: ResolvablePlayer[],
  votes: Record<string, string>,
): boolean {
  const hasInformant = players.some((p) => p.role === 'informant');
  if (!hasInformant) return false;
  const tally = tallyVotes(votes);
  if (tally.topTargets.length !== 1) return false;
  const votedOut = players.find((p) => p.id === tally.topTargets[0]);
  return votedOut?.role === 'impostor';
}
