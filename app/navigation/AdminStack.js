import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { customScreenOptions } from "./enableScreenOptions";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import ReportsScreen from "../screens/admin/ReportsScreen";
import EmployeeDetailsScreen from "../screens/admin/EmployeeDetailsScreen";
import EmployeeListScreen from "../screens/admin/EmployeeListScreen";
import CreateAdminScreen from "../screens/admin/CreateAdminScreen";
import VehicleManagementScreen from "../screens/admin/VehicleManagementScreen";
import StationManagementScreen from "../screens/admin/StationManagementScreen";

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  useEffect(() => {
    console.log("AdminStack - Component mounted");
  }, []);

  console.log("AdminStack - Rendering admin navigation");

  return (
    <Stack.Navigator
      initialRouteName="AdminHome"
      screenOptions={customScreenOptions}
    >
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          title: "Admin Dashboard",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: "Employee Reports",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        options={{
          title: "Manage Employees",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EmployeeDetails"
        component={EmployeeDetailsScreen}
        options={{
          title: "Employee Details",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CreateAdmin"
        component={CreateAdminScreen}
        options={{
          title: "Create Admin Account",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="VehicleManagement"
        component={VehicleManagementScreen}
        options={{
          title: "Vehicle Fleet Management",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="StationManagement"
        component={StationManagementScreen}
        options={{
          title: "Station Management",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminStack;
