import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
  authDomain: "prepai-f5816.firebaseapp.com",
  projectId: "prepai-f5816",
  storageBucket: "prepai-f5816.firebasestorage.app",
  messagingSenderId: "785407085912",
  appId: "1:785407085912:web:88612d6e0500751c0c292d",
  measurementId: "G-BB710X29LJ"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
