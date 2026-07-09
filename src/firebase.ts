import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, query, orderBy, onSnapshot, limit, deleteDoc, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase config is loaded exclusively from Vite environment variables (VITE_FB_*).
// This prevents raw credentials in firebase-applet-config.json from being statically bundled into the client JS.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_APIKEY,
  authDomain: import.meta.env.VITE_FB_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECTID,
  storageBucket: import.meta.env.VITE_FB_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MSGSENDERID || import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APPID,
};

export const firebaseConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!firebaseConfigValid) {
  console.error(
    "Firebase config is missing. Make sure VITE_FB_* environment variables " +
    "are set (see .env.example) before running `npm run dev` or `npm run build`."
  );
}

// Initialize Firebase only when the build-time config is complete.
const app: FirebaseApp | null = firebaseConfigValid ? initializeApp(firebaseConfig) : null;

// Use custom firestoreDatabaseId if provided, else (default)
const firestoreDbId = import.meta.env.VITE_FB_FIRESTOREDATABASEID || "(default)";
export const db = app ? getFirestore(app, firestoreDbId) : null;
export let auth: Auth | null = null;

if (firebaseConfigValid && app) {
  auth = getAuth(app);
} else {
  console.warn(
    "Firebase initialization skipped because the build-time configuration is incomplete. " +
    "The app will use the built-in gallery data instead of Firestore."
  );
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { collection, addDoc, getDocs, setDoc, doc, query, orderBy, onSnapshot, limit, deleteDoc };

