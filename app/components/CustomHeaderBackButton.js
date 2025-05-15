import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomHeaderBackButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>Back</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    padding: 5,
  },
  text: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "500",
  },
});

export default CustomHeaderBackButton;
