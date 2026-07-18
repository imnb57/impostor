import Constants from 'expo-constants';
import {
  GoogleAuthProvider,
  linkWithCredential,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const isGoogleAuthConfigured = Boolean(googleWebClientId);

// The auth.expo.io proxy is gone, so the OAuth redirect needs the app's own
// scheme — which only exists in a real build, not inside the Expo Go client.
export const isRunningInExpoGo = Constants.appOwnership === 'expo';

export interface GoogleProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function getGoogleProfile(): GoogleProfile | null {
  const user = getFirebaseAuth().currentUser;
  const info = user?.providerData.find((p) => p.providerId === 'google.com');
  if (!info) return null;
  return {
    displayName: info.displayName,
    email: info.email,
    photoURL: info.photoURL,
  };
}

/**
 * Signs in with a Google ID token. If the player already has an anonymous
 * session, the Google account is linked onto it so the game UID (and any
 * in-progress room membership) is kept. Falls back to a plain sign-in when
 * the Google account is already tied to another Firebase user.
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  if (auth.currentUser) {
    try {
      await linkWithCredential(auth.currentUser, credential);
      return getGoogleProfile();
    } catch (error) {
      const code = (error as { code?: string }).code;
      const alreadyTaken =
        code === 'auth/credential-already-in-use' ||
        code === 'auth/email-already-in-use' ||
        code === 'auth/provider-already-linked';
      if (!alreadyTaken) throw error;
    }
  }
  await signInWithCredential(auth, credential);
  return getGoogleProfile();
}

export async function signOutOfGoogle(): Promise<void> {
  await signOut(getFirebaseAuth());
}
