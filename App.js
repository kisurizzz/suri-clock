import React from "react";
import { StatusBar } from "expo-status-bar";
import { FirebaseProvider } from "./app/contexts/FirebaseContext";
import { AuthProvider } from "./app/contexts/AuthContext";
import AppNavigator from "./app/navigation/AppNavigator";

export default function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </FirebaseProvider>
  );
}
