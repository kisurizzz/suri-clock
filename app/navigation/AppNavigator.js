import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import AdminStack from "./AdminStack";
import EmployeeStack from "./EmployeeStack";
import LoadingScreen from "../screens/LoadingScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { currentUser, isAdmin, loading } = useAuth();

  useEffect(() => {
    console.log("AppNavigator - Auth State:", {
      user: currentUser?.email,
      isAdmin,
      loading,
    });
  }, [currentUser, isAdmin, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!currentUser ? (
        // Auth Stack
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // User is logged in
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAdmin ? (
            // Admin Stack
            <Stack.Screen name="AdminStack" component={AdminStack} />
          ) : (
            // Employee Stack
            <Stack.Screen name="EmployeeStack" component={EmployeeStack} />
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
