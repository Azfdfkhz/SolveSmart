// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyCyJICi1Da9eLaJ5bvw9z-1TiMtzYalhdY",
  authDomain: "solvesmart-e883c.firebaseapp.com",
  projectId: "solvesmart-e883c",
  storageBucket: "solvesmart-e883c.appspot.com",
  messagingSenderId: "172572600087",
  appId: "1:172572600087:web:17de66a55f35918e1fb952",
  measurementId: "G-ZGMC4D0SGK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);