import { get, onDisconnect, onValue, ref, remove, set, update } from 'firebase/database';
import { CATEGORIES } from '../constants/categories';
import type { Room } from '../types';
import { ensureSignedIn } from './auth';
import { getDb } from './firebase';
import { generateRoomCode, maxImpostors, pickWord, sample } from './gameLogic';

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
      category: CATEGORIES[0].id,
      impostorCount: 1,
      timerSeconds: 180,
      word: '',
      createdAt: Date.now(),
      players: {
        [uid]: { name: hostName, connected: true, isImpostor: false, hasVoted: false },
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
      isImpostor: false,
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
  settings: Partial<Pick<Room, 'category' | 'impostorCount' | 'timerSeconds'>>,
): Promise<void> {
  await update(ref(getDb(), `rooms/${roomCode}`), settings);
}

/** Host only: pick the word, assign impostors, move everyone to reveal. */
export async function startGame(roomCode: string, room: Room): Promise<void> {
  const playerIds = Object.keys(room.players ?? {});
  const impostorTotal = Math.min(room.impostorCount, maxImpostors(playerIds.length));
  const impostorIds = new Set(sample(playerIds, impostorTotal));
  const updates: Record<string, unknown> = {
    status: 'reveal',
    word: pickWord(room.category),
    votes: null,
    discussionEndsAt: null,
  };
  for (const id of playerIds) {
    updates[`players/${id}/isImpostor`] = impostorIds.has(id);
    updates[`players/${id}/hasVoted`] = false;
  }
  await update(ref(getDb(), `rooms/${roomCode}`), updates);
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
    votes: null,
    discussionEndsAt: null,
  };
  for (const id of Object.keys(room.players ?? {})) {
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
