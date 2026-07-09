import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, query, orderBy, onSnapshot, limit, deleteDoc, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase config is injected at build time from environment variables
// (populated from the FB_* repository secrets in CI — see .env.example).
// Nothing sensitive is hardcoded or committed to source control.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_APIKEY,
  authDomain: import.meta.env.VITE_FB_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECTID,
  storageBucket: import.meta.env.VITE_FB_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MSGSENDERID,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use custom firestoreDatabaseId if provided, else (default)
export const db = getFirestore(app, import.meta.env.VITE_FB_FIRESTOREDATABASEID || "(default)");
export let auth: Auth | null = null;

if (firebaseConfigValid) {
  auth = getAuth(app);
} else {
  console.warn(
    "Firebase auth initialization skipped because the build-time configuration is incomplete. " +
    "The app will render a placeholder instead of connecting to Firestore."
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

