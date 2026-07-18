import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

/** Resolves once Firebase has restored any persisted session. */
function waitForAuthReady(): Promise<void> {
  const auth = getFirebaseAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
}

/** Returns the current anonymous UID, signing in if needed. */
export async function ensureSignedIn(): Promise<string> {
  const auth = getFirebaseAuth();
  await waitForAuthReady();
  if (auth.currentUser) return auth.currentUser.uid;
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}
