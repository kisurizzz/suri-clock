import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    console.log("Setting up auth state listener in AuthContext");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed in AuthContext:",
        user ? `User logged in: ${user.email}` : "No user"
      );

      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            console.log("Auth - Role from Firestore:", userData.role);
            console.log("Auth - Role type:", typeof userData.role);
            console.log("Auth - Role comparison:", userData.role === "admin");

            const isUserAdmin = userData.role === "admin";
            console.log(
              "Is user admin?",
              isUserAdmin,
              "Role from Firestore:",
              userData.role
            );

            // Set both states together to ensure they're in sync
            setCurrentUser(user);
            setIsAdmin(Boolean(isUserAdmin));
            console.log(
              "Auth - Final admin state set to:",
              Boolean(isUserAdmin)
            );
          } else {
            console.log("No user document found in Firestore");
            setCurrentUser(user);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(user);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up function
  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user document with role and user data
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Create admin function (only callable by existing admins)
  const createAdmin = async (email, password, firstName, lastName) => {
    if (!isAdmin) {
      throw new Error("Only admins can create admin accounts");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create admin user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName,
        lastName,
        role: "admin",
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      return user;
    } catch (error) {
      console.error("Create admin error:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Login successful for:", user.email);

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Login - User data from Firestore:", userData);
        console.log("Login - Role from Firestore:", userData.role);
        console.log("Login - Role type:", typeof userData.role);
        console.log("Login - Role comparison:", userData.role === "admin");

        const isUserAdmin = userData.role === "admin";
        console.log("Login - Is user admin?", isUserAdmin);

        // Set both states together
        setCurrentUser(user);
        setIsAdmin(Boolean(isUserAdmin));
        console.log("Login - Final admin state set to:", Boolean(isUserAdmin));
      } else {
        console.log("Login - No user document found in Firestore");
        setCurrentUser(user);
        setIsAdmin(false);
      }

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    createAdmin,
  };

  if (loading) {
    return null; // Return nothing until auth is ready
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
