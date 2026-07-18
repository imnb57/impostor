import type { RoleId } from '../../types';
import { needsAssassination, resolveRound, ResolvablePlayer } from '../resolveRound';

const p = (id: string, role: RoleId): ResolvablePlayer => ({ id, name: id.toUpperCase(), role });

/** Everyone votes for `target`. */
const allVote = (voters: ResolvablePlayer[], target: string): Record<string, string> =>
  Object.fromEntries(voters.map((v) => [v.id, target]));

describe('resolveRound', () => {
  describe('classic', () => {
    const players = [p('a', 'crew'), p('b', 'crew'), p('imp', 'impostor')];

    it('gives the round to the innocents when the impostor is voted out', () => {
      const out = resolveRound({ players, votes: allVote(players, 'imp') });
      expect(out.winners).toContain('crew');
      expect(out.winners).not.toContain('impostor');
      expect(out.votedOutId).toBe('imp');
      expect(out.headline).toMatch(/caught/i);
    });

    it('gives it to the impostor when an innocent is voted out', () => {
      const out = resolveRound({ players, votes: allVote(players, 'a') });
      expect(out.winners).toEqual(['impostor']);
      expect(out.tie).toBe(false);
    });

    it('treats a tie as nobody ejected, so the impostor survives', () => {
      const out = resolveRound({
        players,
        votes: { a: 'imp', b: 'a', imp: 'a' }, // imp:1, a:2 → not a tie
      });
      expect(out.votedOutId).toBe('a');

      const tied = resolveRound({ players, votes: { a: 'imp', imp: 'a' } });
      expect(tied.tie).toBe(true);
      expect(tied.votedOutId).toBeNull();
      expect(tied.winners).toEqual(['impostor']);
    });

    it('handles nobody voting at all', () => {
      const out = resolveRound({ players, votes: {} });
      expect(out.tie).toBe(true);
      expect(out.winners).toEqual(['impostor']);
    });
  });

  describe('saboteur', () => {
    const players = [p('a', 'crew'), p('b', 'crew'), p('sab', 'saboteur'), p('imp', 'impostor')];

    it('wins when an innocent is voted out', () => {
      const out = resolveRound({ players, votes: allVote(players, 'a') });
      expect(out.winners).toContain('saboteur');
      expect(out.winners).toContain('impostor');
      expect(out.headline).toMatch(/saboteur/i);
    });

    it('loses when the impostor is caught', () => {
      const out = resolveRound({ players, votes: allVote(players, 'imp') });
      expect(out.winners).not.toContain('saboteur');
      expect(out.winners).toContain('crew');
    });

    it('loses when the saboteur themselves is voted out, and the impostor still survives', () => {
      const out = resolveRound({ players, votes: allVote(players, 'sab') });
      expect(out.winners).toEqual(['impostor']);
      expect(out.headline).toMatch(/saboteur was caught/i);
    });

    it('does not win on a tie — an innocent must actually be ejected', () => {
      const out = resolveRound({ players, votes: { a: 'imp', imp: 'a' } });
      expect(out.winners).not.toContain('saboteur');
    });
  });

  describe('informant and assassination', () => {
    const players = [p('a', 'crew'), p('inf', 'informant'), p('b', 'crew'), p('imp', 'impostor')];

    it('wins alongside the crew when the impostor is caught and not assassinated', () => {
      const out = resolveRound({ players, votes: allVote(players, 'imp') });
      expect(out.winners).toContain('informant');
      expect(out.assassinated).toBe(false);
    });

    it('flips the round to the impostor when the informant is correctly named', () => {
      const out = resolveRound({
        players,
        votes: allVote(players, 'imp'),
        assassinGuess: 'inf',
      });
      expect(out.assassinated).toBe(true);
      expect(out.winners).toEqual(['impostor']);
      expect(out.headline).toMatch(/assassinated/i);
    });

    it('leaves the innocents winning when the assassin guesses wrong', () => {
      const out = resolveRound({ players, votes: allVote(players, 'imp'), assassinGuess: 'a' });
      expect(out.assassinated).toBe(false);
      expect(out.winners).toContain('crew');
    });

    it('ignores a guess when the impostor was never caught', () => {
      const out = resolveRound({ players, votes: allVote(players, 'a'), assassinGuess: 'inf' });
      expect(out.assassinated).toBe(false);
      expect(out.winners).toEqual(['impostor']);
    });
  });

  describe('needsAssassination', () => {
    const withInformant = [p('a', 'crew'), p('inf', 'informant'), p('imp', 'impostor')];
    const withoutInformant = [p('a', 'crew'), p('b', 'crew'), p('imp', 'impostor')];

    it('runs only when an informant is in play and the impostor was ejected', () => {
      expect(needsAssassination(withInformant, allVote(withInformant, 'imp'))).toBe(true);
    });

    it('does not run without an informant', () => {
      expect(needsAssassination(withoutInformant, allVote(withoutInformant, 'imp'))).toBe(false);
    });

    it('does not run when an innocent was ejected', () => {
      expect(needsAssassination(withInformant, allVote(withInformant, 'a'))).toBe(false);
    });

    it('does not run on a tie', () => {
      expect(needsAssassination(withInformant, { a: 'imp', imp: 'a' })).toBe(false);
    });
  });
});
