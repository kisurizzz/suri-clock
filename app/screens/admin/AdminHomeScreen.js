import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const AdminHomeScreen = ({ navigation }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  useEffect(() => {
    console.log("AdminHomeScreen - Current State:", {
      user: currentUser?.email,
      isAdmin,
    });
  }, [currentUser, isAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {currentUser?.email}</Text>
          <Text style={styles.roleText}>Administrator</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Reports")}
          >
            <Text style={styles.menuItemText}>View Employee Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("CreateAdmin")}
          >
            <Text style={styles.menuItemText}>Create Admin Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EmployeeDetails")}
          >
            <Text style={styles.menuItemText}>Manage Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "500",
  },
  menuContainer: {
    gap: 15,
  },
  menuItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#e74c3c",
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default AdminHomeScreen;
