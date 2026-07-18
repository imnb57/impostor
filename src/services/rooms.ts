import { get, onDisconnect, onValue, ref, remove, set, update } from 'firebase/database';
import { CATEGORIES } from '../constants/categories';
import type { Room } from '../types';
import { ensureSignedIn } from './auth';
import { getDb } from './firebase';
import { generateRoomCode, pickRound } from './gameLogic';
import { assignRoles, buildPayloads } from './roles';

const MAX_CODE_ATTEMPTS = 5;

export interface RoomSession {
  roomCode: string;
  uid: string;
}

async function trackPresence(roomCode: string, uid: string): Promise<void> {
  const connectedRef = ref(getDb(), `rooms/${roomCode}/players/${uid}/connected`);
  await onDisconnect(connectedRef).set(false);
  await set(connectedRef, true);
}

export async function createRoom(hostName: string): Promise<RoomSession> {
  const uid = await ensureSignedIn();
  const db = getDb();
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const roomCode = generateRoomCode();
    const roomRef = ref(db, `rooms/${roomCode}`);
    const existing = await get(roomRef);
    if (existing.exists()) continue;
    const room: Room = {
      hostId: uid,
      status: 'lobby',
      mode: 'classic',
      category: CATEGORIES[0].id,
      impostorCount: 1,
      timerSeconds: 180,
      word: '',
      hint: '',
      createdAt: Date.now(),
      players: {
        [uid]: {
          name: hostName,
          connected: true,
          role: 'crew',
          payload: {},
          hasVoted: false,
        },
      },
    };
    await set(roomRef, room);
    await trackPresence(roomCode, uid);
    return { roomCode, uid };
  }
  throw new Error('Could not find a free room code — try again.');
}

/** Joins a lobby, or rejoins a room the player is already part of (reconnect). */
export async function joinRoom(roomCode: string, name: string): Promise<RoomSession> {
  const uid = await ensureSignedIn();
  const db = getDb();
  const snapshot = await get(ref(db, `rooms/${roomCode}`));
  if (!snapshot.exists()) throw new Error('Room not found — check the code.');
  const room = snapshot.val() as Room;
  const alreadyIn = Boolean(room.players?.[uid]);
  if (!alreadyIn && room.status !== 'lobby') {
    throw new Error('That game has already started.');
  }
  if (alreadyIn) {
    await update(ref(db, `rooms/${roomCode}/players/${uid}`), { name, connected: true });
  } else {
    await set(ref(db, `rooms/${roomCode}/players/${uid}`), {
      name,
      connected: true,
      role: 'crew',
      payload: {},
      hasVoted: false,
    });
  }
  await trackPresence(roomCode, uid);
  return { roomCode, uid };
}

export function subscribeRoom(
  roomCode: string,
  callback: (room: Room | null) => void,
): () => void {
  const roomRef = ref(getDb(), `rooms/${roomCode}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Room) : null);
  });
}

export async function updateRoomSettings(
  roomCode: string,
  settings: Partial<Pick<Room, 'category' | 'impostorCount' | 'timerSeconds' | 'mode'>>,
): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), settings);
}

/** Host only: pick the word, deal roles for the mode, move everyone to reveal. */
export async function startGame(roomCode: string, room: Room): Promise<void> {
  const players = room.players ?? {};
  const playerIds = Object.keys(players);
  const namesById = Object.fromEntries(playerIds.map((id) => [id, players[id].name]));
  const mode = room.mode ?? 'classic';
  const seed = pickRound(room.category);
  const roles = assignRoles(mode, playerIds, room.impostorCount);
  const payloads = buildPayloads(mode, roles, seed, namesById);

  const updates: Record<string, unknown> = {
    status: 'reveal',
    roundCategory: seed.categoryId,
    word: seed.word,
    hint: seed.impostorHint,
    votes: null,
    discussionEndsAt: null,
    assassinGuess: null,
  };
  for (const id of playerIds) {
    updates[`players/${id}/role`] = roles[id];
    updates[`players/${id}/payload`] = payloads[id] ?? {};
    // Mirrored for any client still running a pre-roles build.
    updates[`players/${id}/isImpostor`] = roles[id] === 'impostor';
    updates[`players/${id}/hasVoted`] = false;
  }
  await update(ref(getDb(), `rooms/${roomCode}`), updates);
}

/** Host only: the vote ejected an impostor and an informant is in play. */
export async function beginAssassination(roomCode: string): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), { status: 'assassination' });
}

/** An impostor names who they believe the informant was. */
export async function submitAssassinGuess(
  roomCode: string,
  targetUid: string,
): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), {
    assassinGuess: targetUid,
    status: 'results',
  });
}

export async function beginDiscussion(roomCode: string, timerSeconds: number): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), {
    status: 'discussion',
    discussionEndsAt: Date.now() + timerSeconds * 1000,
  });
}

export async function beginVoting(roomCode: string): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), { status: 'voting' });
}

export async function castVote(
  roomCode: string,
  voterUid: string,
  targetUid: string,
): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), {
    [`votes/${voterUid}`]: targetUid,
    [`players/${voterUid}/hasVoted`]: true,
  });
}

export async function showResults(roomCode: string): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), { status: 'results' });
}

/** Host only: back to lobby keeping the same players and settings. */
export async function playAgain(roomCode: string, room: Room): Promise<void> {
  const updates: Record<string, unknown> = {
    status: 'lobby',
    word: '',
    hint: '',
    assassinGuess: null,
    votes: null,
    discussionEndsAt: null,
  };
  for (const id of Object.keys(room.players ?? {})) {
    updates[`players/${id}/role`] = 'crew';
    updates[`players/${id}/payload`] = {};
    updates[`players/${id}/isImpostor`] = false;
    updates[`players/${id}/hasVoted`] = false;
  }
  await update(ref(getDb(), `rooms/${roomCode}`), updates);
}

export async function leaveRoom(
  roomCode: string,
  uid: string,
  room: Room | null,
): Promise<void> {
  const db = getDb();
  await onDisconnect(ref(db, `rooms/${roomCode}/players/${uid}/connected`)).cancel();
  const remaining = Object.keys(room?.players ?? {}).filter((id) => id !== uid);
  if (remaining.length === 0) {
    await remove(ref(db, `rooms/${roomCode}`));
    return;
  }
  const updates: Record<string, unknown> = {
    [`players/${uid}`]: null,
    [`votes/${uid}`]: null,
  };
  if (room && room.hostId === uid) {
    updates.hostId = remaining[0];
  }
  await update(ref(db, `rooms/${roomCode}`), updates);
}
