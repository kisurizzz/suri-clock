import React from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";

const EmployeeDetailsScreen = ({ route }) => {
  const { userId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Employee Details</Text>
        <Text style={styles.subtitle}>User ID: {userId || "Unknown"}</Text>
        <Text style={styles.message}>Employee details coming soon!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    color: "#3498db",
  },
});

export default EmployeeDetailsScreen;
