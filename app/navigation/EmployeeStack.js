import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { customScreenOptions } from "./enableScreenOptions";
import EmployeeHomeScreen from "../screens/employee/EmployeeHomeScreen";
import ClockInOutScreen from "../screens/employee/ClockInOutScreen";
import ProfileScreen from "../screens/employee/ProfileScreen";
import HistoryScreen from "../screens/employee/HistoryScreen";

const Stack = createNativeStackNavigator();

const EmployeeStack = () => {
  return (
    <Stack.Navigator screenOptions={customScreenOptions}>
      <Stack.Screen
        name="EmployeeHome"
        component={EmployeeHomeScreen}
        options={{ title: "Employee Dashboard" }}
      />
      <Stack.Screen
        name="ClockInOut"
        component={ClockInOutScreen}
        options={{ title: "Clock In/Out" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "Clock History" }}
      />
    </Stack.Navigator>
  );
};

export default EmployeeStack;
