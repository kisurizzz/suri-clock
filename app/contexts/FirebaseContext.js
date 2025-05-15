import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/firebase";

// Create Firebase context
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Wait for auth to be ready
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged(() => {
            unsubscribe();
            resolve();
          });
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("Firebase initialization error:", error);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeFirebase();
  }, []);

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseContext.Provider value={{ auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase services
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
