import type { GameMode, RoleId } from '../../types';
import { pickRound } from '../gameLogic';
import { assignRoles, buildPayloads, MODES } from '../roles';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);
const namesFor = (list: string[]) => Object.fromEntries(list.map((id) => [id, id.toUpperCase()]));
const count = (roles: Record<string, RoleId>, role: RoleId) =>
  Object.values(roles).filter((r) => r === role).length;

describe('assignRoles', () => {
  it.each(MODES.map((m) => m.id))('always leaves ordinary crew in %s mode', (mode) => {
    const players = ids(6);
    const roles = assignRoles(mode as GameMode, players, 1);
    expect(count(roles, 'crew')).toBeGreaterThan(0);
    expect(Object.keys(roles)).toHaveLength(players.length);
  });

  it('deals the mode-specific extra role exactly once', () => {
    expect(count(assignRoles('saboteur', ids(6), 1), 'saboteur')).toBe(1);
    expect(count(assignRoles('informant', ids(6), 1), 'informant')).toBe(1);
    expect(count(assignRoles('classic', ids(6), 1), 'saboteur')).toBe(0);
    expect(count(assignRoles('classic', ids(6), 1), 'informant')).toBe(0);
  });

  it('never lets impostors reach half the table', () => {
    for (const size of [3, 4, 5, 6, 8, 12]) {
      const roles = assignRoles('classic', ids(size), 99);
      expect(count(roles, 'impostor')).toBeLessThan(size / 2);
      expect(count(roles, 'impostor')).toBeGreaterThanOrEqual(1);
    }
  });

  it('still produces a playable game at the minimum table size', () => {
    const roles = assignRoles('classic', ids(3), 1);
    expect(count(roles, 'impostor')).toBe(1);
    expect(count(roles, 'crew')).toBe(2);
  });
});

describe('buildPayloads', () => {
  const seed = {
    word: 'Pizza',
    hints: ['Italian', 'Shared', 'Delivery'],
    impostorHint: 'Italian',
    decoyFragment: 'Frozen aisle',
  };

  it('gives crew the word and the impostor only a hint', () => {
    const roles: Record<string, RoleId> = { a: 'crew', b: 'crew', imp: 'impostor' };
    const out = buildPayloads('classic', roles, seed, namesFor(['a', 'b', 'imp']));
    expect(out.a.word).toBe('Pizza');
    expect(out.imp.word).toBeUndefined();
    expect(out.imp.hint).toBe('Italian');
  });

  it('lets the saboteur see the real word', () => {
    const roles: Record<string, RoleId> = { a: 'crew', sab: 'saboteur', imp: 'impostor' };
    const out = buildPayloads('saboteur', roles, seed, namesFor(['a', 'sab', 'imp']));
    expect(out.sab.word).toBe('Pizza');
  });

  it('tells the informant an impostor name but never the word', () => {
    const roles: Record<string, RoleId> = { a: 'crew', inf: 'informant', imp: 'impostor' };
    const out = buildPayloads('informant', roles, seed, namesFor(['a', 'inf', 'imp']));
    expect(out.inf.knownImpostorName).toBe('IMP');
    expect(out.inf.word).toBeUndefined();
    expect(out.inf.fragment).toBeUndefined();
  });

  it('deals fragments to crew and a borrowed fragment to the impostor', () => {
    const roles: Record<string, RoleId> = { a: 'crew', b: 'crew', c: 'crew', imp: 'impostor' };
    const out = buildPayloads('fragments', roles, seed, namesFor(['a', 'b', 'c', 'imp']));
    for (const id of ['a', 'b', 'c']) {
      expect(seed.hints).toContain(out[id].fragment);
      expect(out[id].word).toBeUndefined();
    }
    expect(out.imp.fragment).toBe('Frozen aisle');
    expect(seed.hints).not.toContain(out.imp.fragment);
  });

  it('spreads crew across different fragments rather than repeating one', () => {
    const roles: Record<string, RoleId> = { a: 'crew', b: 'crew', c: 'crew', imp: 'impostor' };
    const out = buildPayloads('fragments', roles, seed, namesFor(['a', 'b', 'c', 'imp']));
    const dealt = new Set(['a', 'b', 'c'].map((id) => out[id].fragment));
    expect(dealt.size).toBe(3);
  });
});

describe('pickRound', () => {
  it('produces a decoy fragment that does not belong to the chosen word', () => {
    for (let i = 0; i < 50; i++) {
      const seed = pickRound('food');
      expect(seed.word).toBeTruthy();
      expect(seed.hints.length).toBeGreaterThan(0);
      expect(seed.hints).toContain(seed.impostorHint);
      expect(seed.hints).not.toContain(seed.decoyFragment);
    }
  });
});
