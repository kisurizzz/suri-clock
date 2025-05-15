import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const EmployeeHomeScreen = ({ navigation }) => {
  const { currentUser, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome</Text>
          <Text style={styles.headerSubtitle}>{currentUser?.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ClockInOut")}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Clock In/Out</Text>
              <Text style={styles.menuItemDescription}>
                Start or end your work shift
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("History")}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>History</Text>
              <Text style={styles.menuItemDescription}>
                View your work history
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Profile</Text>
              <Text style={styles.menuItemDescription}>
                View and update your profile
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 8,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: "column",
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmployeeHomeScreen;
