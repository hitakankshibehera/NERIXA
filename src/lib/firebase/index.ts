// ============================================================
// NER-SHIELD AI — Firebase SDK Initialization & Service Module
// Project: nerixa-2e6f6
// Services: Firebase Authentication, Realtime Database, Firestore, Analytics
// ============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  onValue,
  off,
  type Database,
} from 'firebase/database';
import { getFirestore, type Firestore } from 'firebase/firestore';
import type { Incident, Alert, User, UserRole } from '@/lib/types';

// Web App's Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCr9E6UEfvPC0n-ueYjTrrSM0BBAyUemn4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nerixa-2e6f6.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://nerixa-2e6f6-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nerixa-2e6f6',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nerixa-2e6f6.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '881545462254',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:881545462254:web:e6b1f539fef358a1b08eff',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-KEG5H7726C',
};

// Singleton Firebase initialization (prevents duplicate instances during Next.js hot-reload)
let app: FirebaseApp;
let auth: Auth;
let database: Database;
let firestore: Firestore;

if (typeof window !== 'undefined' || getApps().length > 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  firestore = getFirestore(app);

  // Initialize Analytics safely in browser
  if (typeof window !== 'undefined') {
    import('firebase/analytics')
      .then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) {
            getAnalytics(app);
          }
        });
      })
      .catch((err) => {
        console.debug('Firebase Analytics initialization skipped:', err);
      });
  }
} else {
  // Server-side initialization
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  firestore = getFirestore(app);
}

export { app, auth, database, firestore };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ============================================================
// 1. AUTHENTICATION HELPERS
// ============================================================

/**
 * Sign in with Email and Password
 */
export async function firebaseSignInEmail(email: string, pass: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

/**
 * Register with Email, Password, Name, and Role
 */
export async function firebaseSignUpEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'VIEWER'
): Promise<{ user: FirebaseUser; userProfile: User }> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  if (displayName) {
    try {
      await updateProfile(fbUser, { displayName });
    } catch (e) {
      console.warn('Could not update profile displayName:', e);
    }
  }

  const profile: User = {
    id: fbUser.uid,
    email: fbUser.email || email,
    name: displayName || email.split('@')[0],
    role,
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  // Persist user profile to Realtime Database
  await saveUserProfileToDb(profile);

  return { user: fbUser, userProfile: profile };
}

/**
 * Sign in with Google Popup
 */
export async function firebaseSignInWithGoogle(): Promise<{ user: FirebaseUser; userProfile: User }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser = credential.user;

  // Check if profile already exists in DB, otherwise initialize
  let profile = await getUserProfileFromDb(fbUser.uid);
  if (!profile) {
    profile = {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || 'Authorized Responder',
      role: 'DISTRICT_OFFICER',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    await saveUserProfileToDb(profile);
  } else {
    profile.lastLogin = new Date().toISOString();
    await saveUserProfileToDb(profile);
  }

  return { user: fbUser, userProfile: profile };
}

/**
 * Sign Out
 */
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Auth State Listener
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================
// 2. REALTIME DATABASE HELPERS (nerixa-2e6f6-default-rtdb)
// ============================================================

/**
 * Save user profile in Realtime Database under /users/{uid}
 */
export async function saveUserProfileToDb(user: User): Promise<void> {
  try {
    const userRef = ref(database, `users/${user.id}`);
    await set(userRef, user);
  } catch (err) {
    console.error('Error saving user profile to Realtime Database:', err);
  }
}

/**
 * Fetch user profile from Realtime Database under /users/{uid}
 */
export async function getUserProfileFromDb(uid: string): Promise<User | null> {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as User;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile from Realtime Database:', err);
    return null;
  }
}

/**
 * Push a new SOS Incident to Realtime Database under /incidents
 */
export async function pushIncidentToRealtimeDb(incident: Incident): Promise<string> {
  try {
    const incidentsRef = ref(database, 'incidents');
    const newRef = push(incidentsRef);
    const incidentWithId = {
      ...incident,
      firebaseId: newRef.key,
      syncedAt: new Date().toISOString(),
    };
    await set(newRef, incidentWithId);
    return newRef.key || incident.id;
  } catch (err) {
    console.error('Error pushing incident to Realtime Database:', err);
    return incident.id;
  }
}

/**
 * Listen for real-time live Incidents across all connected responders
 */
export function subscribeToRealtimeIncidents(onIncidents: (incidents: Incident[]) => void): () => void {
  const incidentsRef = ref(database, 'incidents');
  const unsubscribe = onValue(
    incidentsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: Incident[] = Object.values(data);
        onIncidents(list);
      } else {
        onIncidents([]);
      }
    },
    (err) => {
      console.warn('Realtime Database incident subscription warning:', err);
    }
  );

  return () => off(incidentsRef, 'value', unsubscribe);
}

/**
 * Push an Alert to Realtime Database under /alerts
 */
export async function pushAlertToRealtimeDb(alert: Alert): Promise<string> {
  try {
    const alertsRef = ref(database, 'alerts');
    const newRef = push(alertsRef);
    await set(newRef, { ...alert, firebaseId: newRef.key });
    return newRef.key || alert.id;
  } catch (err) {
    console.error('Error pushing alert to Realtime Database:', err);
    return alert.id;
  }
}

/**
 * Listen for real-time live Alerts across all emergency teams
 */
export function subscribeToRealtimeAlerts(onAlerts: (alerts: Alert[]) => void): () => void {
  const alertsRef = ref(database, 'alerts');
  const unsubscribe = onValue(
    alertsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: Alert[] = Object.values(data);
        onAlerts(list);
      } else {
        onAlerts([]);
      }
    },
    (err) => {
      console.warn('Realtime Database alert subscription warning:', err);
    }
  );

  return () => off(alertsRef, 'value', unsubscribe);
}

/**
 * Monitor Realtime Database connectivity (.info/connected)
 */
export function subscribeToDatabaseConnection(onStatusChange: (connected: boolean) => void): () => void {
  const connectedRef = ref(database, '.info/connected');
  const unsubscribe = onValue(connectedRef, (snap) => {
    onStatusChange(Boolean(snap.val()));
  });
  return () => off(connectedRef, 'value', unsubscribe);
}
