import type { GameMode, RoleId, RolePayload } from '../types';
import type { RoundSeed } from './gameLogic';
import { sample } from './gameLogic';

export interface ModeMeta {
  id: GameMode;
  name: string;
  emoji: string;
  blurb: string;
  /** Extra non-impostor role this mode deals, if any. */
  extraRole: RoleId | null;
  minPlayers: number;
}

export const MODES: ModeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    emoji: '🕵️',
    blurb: 'Everyone knows the word. The impostor gets a clue.',
    extraRole: null,
    minPlayers: 3,
  },
  {
    id: 'saboteur',
    name: 'Saboteur',
    emoji: '🎭',
    blurb: 'One player knows the word but wants an innocent voted out.',
    extraRole: 'saboteur',
    minPlayers: 4,
  },
  {
    id: 'informant',
    name: 'Informant',
    emoji: '🔍',
    blurb: 'One player knows who the impostor is — but can be assassinated.',
    extraRole: 'informant',
    minPlayers: 4,
  },
  {
    id: 'fragments',
    name: 'Fragments',
    emoji: '🧩',
    blurb: 'Nobody gets the word — only pieces. One piece is fake.',
    extraRole: null,
    minPlayers: 4,
  },
];

export function getMode(id: GameMode): ModeMeta {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}

export interface RoleMeta {
  label: string;
  emoji: string;
  tagline: string;
  /** Drives the card's accent treatment. */
  sinister: boolean;
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  crew: { label: 'CREW', emoji: '🧠', tagline: 'Describe it — never say it.', sinister: false },
  impostor: { label: 'IMPOSTOR', emoji: '🤫', tagline: "Blend in. Don't get caught.", sinister: true },
  saboteur: {
    label: 'SABOTEUR',
    emoji: '🎭',
    tagline: 'Get an innocent voted out.',
    sinister: true,
  },
  informant: {
    label: 'INFORMANT',
    emoji: '🔍',
    tagline: 'You know one name. Use it carefully.',
    sinister: false,
  },
};

/**
 * Deals roles for a mode. Impostors are capped so they can never reach parity
 * with the innocents, and the mode's extra role is only dealt when there are
 * enough players left to still have a crew.
 */
export function assignRoles(
  mode: GameMode,
  playerIds: string[],
  impostorCount: number,
): Record<string, RoleId> {
  const roles: Record<string, RoleId> = {};
  for (const id of playerIds) roles[id] = 'crew';

  const extra = getMode(mode).extraRole;
  // Leave at least one plain crew member alongside the impostors and extra role.
  const maxImpostors = Math.max(1, Math.floor((playerIds.length - (extra ? 1 : 0) - 1) / 2) || 1);
  const impostors = sample(playerIds, Math.min(impostorCount, maxImpostors));
  for (const id of impostors) roles[id] = 'impostor';

  if (extra) {
    const remaining = playerIds.filter((id) => roles[id] === 'crew');
    // Never deal the extra role if it would leave nobody as ordinary crew.
    if (remaining.length > 1) {
      const [chosen] = sample(remaining, 1);
      if (chosen) roles[chosen] = extra;
    }
  }

  return roles;
}

/**
 * Builds what each player sees. In fragments mode the crew are split across
 * the word's facets and the impostor is handed a facet borrowed from a
 * different word, so their clue sounds plausible but points somewhere else.
 */
export function buildPayloads(
  mode: GameMode,
  roles: Record<string, RoleId>,
  seed: RoundSeed,
  namesById: Record<string, string>,
): Record<string, RolePayload> {
  const payloads: Record<string, RolePayload> = {};
  const ids = Object.keys(roles);
  const impostorIds = ids.filter((id) => roles[id] === 'impostor');
  const firstImpostorName = impostorIds.length ? namesById[impostorIds[0]] : undefined;

  let crewSeen = 0;
  for (const id of ids) {
    const role = roles[id];

    if (role === 'impostor') {
      payloads[id] =
        mode === 'fragments' ? { fragment: seed.decoyFragment } : { hint: seed.impostorHint };
      continue;
    }

    if (role === 'informant') {
      payloads[id] = { knownImpostorName: firstImpostorName };
      continue;
    }

    // crew and saboteur both know the truth; the saboteur just wants it lost.
    if (mode === 'fragments') {
      payloads[id] = { fragment: seed.hints[crewSeen % seed.hints.length] };
      crewSeen += 1;
    } else {
      payloads[id] = { word: seed.word };
    }
  }

  return payloads;
}
