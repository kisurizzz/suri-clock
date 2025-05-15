import React from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";

const HistoryScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Work History</Text>
        <Text style={styles.message}>Clock history coming soon!</Text>
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
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    color: "#3498db",
  },
});

export default HistoryScreen;
