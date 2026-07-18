import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, initializeAuth } from 'firebase/auth';
// @ts-expect-error — exported by the react-native bundle of firebase/auth
// (which Metro resolves via the "react-native" main field) but missing from
// the web typings shipped with the SDK.
import { getReactNativePersistence } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Database | undefined;

function getApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

// Single initializeAuth call with AsyncStorage persistence so the anonymous
// UID survives app restarts (required for reconnect). Never call getAuth()
// elsewhere — it would silently fall back to in-memory persistence.
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = initializeAuth(getApp(), {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return authInstance;
}

export function getDb(): Database {
  if (!dbInstance) dbInstance = getDatabase(getApp());
  return dbInstance;
}
