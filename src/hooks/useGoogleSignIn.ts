import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';
import {
  getGoogleProfile,
  googleAndroidClientId,
  googleWebClientId,
  GoogleProfile,
  isGoogleAuthConfigured,
  isRunningInExpoGo,
  signInWithGoogleIdToken,
} from '../services/googleAuth';

WebBrowser.maybeCompleteAuthSession();

/** Live Google profile of the current Firebase user (null when not linked). */
export function useGoogleProfile(): GoogleProfile | null {
  const [profile, setProfile] = useState<GoogleProfile | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), () =>
      setProfile(getGoogleProfile()),
    );
    return unsubscribe;
  }, []);

  return profile;
}

interface GoogleSignInState {
  /** False in Expo Go or when client IDs / Firebase are not configured. */
  available: boolean;
  busy: boolean;
  error: string | null;
  signIn: () => void;
}

export function useGoogleSignIn(
  onSignedIn?: (profile: GoogleProfile | null) => void,
): GoogleSignInState {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleWebClientId,
    webClientId: googleWebClientId,
    androidClientId: googleAndroidClientId,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSignedInRef = useRef(onSignedIn);
  onSignedInRef.current = onSignedIn;

  useEffect(() => {
    if (!response) return;
    if (response.type === 'error') {
      setError('Google sign-in failed — try again.');
      return;
    }
    if (response.type !== 'success') return;
    const idToken = response.params.id_token;
    if (!idToken) {
      setError('Google returned no ID token.');
      return;
    }
    setBusy(true);
    setError(null);
    signInWithGoogleIdToken(idToken)
      .then((profile) => onSignedInRef.current?.(profile))
      .catch((e) => setError(e instanceof Error ? e.message : 'Sign-in failed.'))
      .finally(() => setBusy(false));
  }, [response]);

  return {
    available:
      isFirebaseConfigured && isGoogleAuthConfigured && !isRunningInExpoGo && Boolean(request),
    busy,
    error,
    signIn: () => {
      promptAsync().catch(() => setError('Could not open Google sign-in.'));
    },
  };
}
