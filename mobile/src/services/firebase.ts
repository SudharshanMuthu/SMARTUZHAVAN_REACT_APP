import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is provided by React Native bundle of @firebase/auth
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseConfig, FirebaseServiceState } from '../types/firebase';

/**
 * Extracts Firebase configuration from Expo environment variables.
 * In Expo, variables prefixed with EXPO_PUBLIC_ are accessible on the client.
 */
export const getFirebaseConfigFromEnv = (): {
  config: FirebaseConfig | null;
  missingKeys: string[];
} => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

  const missingKeys: string[] = [];

  if (!apiKey || apiKey.includes('your_firebase_api_key_here')) {
    missingKeys.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  }
  if (!authDomain || authDomain.includes('your_project_id')) {
    missingKeys.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  }
  if (!projectId || projectId.includes('your_project_id')) {
    missingKeys.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  }
  if (!appId || appId.includes('your_app_id')) {
    missingKeys.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  }

  if (missingKeys.length > 0) {
    return { config: null, missingKeys };
  }

  return {
    config: {
      apiKey: apiKey as string,
      authDomain: authDomain as string,
      projectId: projectId as string,
      storageBucket: storageBucket ?? '',
      messagingSenderId: messagingSenderId ?? '',
      appId: appId as string,
      measurementId: measurementId,
    },
    missingKeys: [],
  };
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

const { config, missingKeys } = getFirebaseConfigFromEnv();

let serviceState: FirebaseServiceState = {
  status: 'PREPARED_NOT_CONFIGURED',
  isConfigured: false,
  missingKeys,
};

/**
 * Safe initialization guard:
 * We do NOT initialize a connection using invented or placeholder credentials.
 * When real credentials are provided via .env, Firebase is initialized cleanly.
 */
if (config) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(config) : getApp();
    try {
      if (typeof getReactNativePersistence === 'function') {
        authInstance = initializeAuth(appInstance, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } else {
        authInstance = getAuth(appInstance);
      }
    } catch {
      authInstance = getAuth(appInstance);
    }
    firestoreInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);

    serviceState = {
      status: 'CONFIGURED_READY',
      isConfigured: true,
      missingKeys: [],
    };
  } catch (error) {
    serviceState = {
      status: 'INITIALIZATION_FAILED',
      isConfigured: false,
      missingKeys: [],
    };
  }
}

/**
 * Returns current status of the Firebase integration module.
 * Clearly differentiates between PREPARED vs CONFIGURED.
 */
export const getFirebaseServiceState = (): FirebaseServiceState => serviceState;

/**
 * Safe accessor for Firebase Auth. Throws an informative error if called before configuration.
 */
export const getFirebaseAuth = (): Auth => {
  if (!authInstance) {
    throw new Error(
      '[Firebase Service] Auth is not configured. Please supply valid EXPO_PUBLIC_FIREBASE_* variables in .env.'
    );
  }
  return authInstance;
};

/**
 * Safe accessor for Cloud Firestore. Throws an informative error if called before configuration.
 */
export const getFirebaseFirestore = (): Firestore => {
  if (!firestoreInstance) {
    throw new Error(
      '[Firebase Service] Firestore is not configured. Please supply valid EXPO_PUBLIC_FIREBASE_* variables in .env.'
    );
  }
  return firestoreInstance;
};

/**
 * Safe accessor for Firebase Storage. Throws an informative error if called before configuration.
 */
export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storageInstance) {
    throw new Error(
      '[Firebase Service] Storage is not configured. Please supply valid EXPO_PUBLIC_FIREBASE_* variables in .env.'
    );
  }
  return storageInstance;
};
