// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// You can keep this hard-coded for now,
// or later switch to env vars if you want.
const firebaseConfig = {
  apiKey: "AIzaSyA-qbtDAO7U9LDN29mmC7LRtYrd498ppBE",
  authDomain: "add-up-cafe.firebaseapp.com",
  projectId: "add-up-cafe",
  storageBucket: "add-up-cafe.firebasestorage.app",
  messagingSenderId: "781366223288",
  appId: "1:781366223288:web:aeda47c7613362bb06af4d",
  measurementId: "G-RELK5NRCBF",
};

// Avoid re-initializing the app on hot reload in dev
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export both auth and db so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
