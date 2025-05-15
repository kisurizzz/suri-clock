import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkvSA8G1oervCyRl2udefK8g_iXHJMf84",
  authDomain: "suri-hub.firebaseapp.com",
  projectId: "suri-hub",
  storageBucket: "suri-hub.firebasestorage.app",
  messagingSenderId: "1073947036420",
  appId: "1:1073947036420:web:c7fc2d33d2c2921443de51",
  measurementId: "G-0YWJM56H60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Export the initialized services
export { app, auth, db };

// This file maintains compatibility with existing code
import { useFirebase } from "../contexts/FirebaseContext";

// Get the firebase services (only use within components)
export const useFirebaseServices = () => {
  const { auth, db } = useFirebase();
  return { auth, db };
};

// No default export to encourage using the hook
export default undefined;
