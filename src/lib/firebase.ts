import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLYxLDBGl9QrAsqIXU9L4jjw2GpMYMyzo",
  authDomain: "voiv-f4391.firebaseapp.com",
  projectId: "voiv-f4391",
  storageBucket: "voiv-f4391.firebasestorage.app",
  messagingSenderId: "356312940280",
  appId: "1:356312940280:web:48c68a2081ab7afc0f050d",
  measurementId: "G-BCW4X07GVN",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
