import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3hlc_a6mMRBWKGA2UFkY4wFIUUPieaTA",
  authDomain: "toduro-fc5ed.firebaseapp.com",
  databaseURL: "https://toduro-fc5ed-default-rtdb.firebaseio.com",
  projectId: "toduro-fc5ed",
  storageBucket: "toduro-fc5ed.firebasestorage.app",
  messagingSenderId: "867570498244",
  appId: "1:867570498244:web:dec5512ea8c53e98a86791",
  //measurementId: "G-KJ8DK5B19P"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const database = getDatabase(app);
export const auth = getAuth(app);

export default app;