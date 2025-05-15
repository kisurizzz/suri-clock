import React from "react";
import { View } from "react-native";
import CustomHeaderBackButton from "../components/CustomHeaderBackButton";

export const customScreenOptions = ({ navigation }) => ({
  headerBackVisible: false,
  headerTitleAlign: "center",
  headerLeft: ({ canGoBack }) =>
    canGoBack ? (
      <CustomHeaderBackButton onPress={() => navigation.goBack()} />
    ) : null,
  headerStyle: {
    backgroundColor: "#f5f5f5",
  },
  headerTintColor: "#2c3e50",
  headerTitleStyle: {
    fontWeight: "bold",
  },
  // Disable the built-in back button image
  headerBackImageSource: null,
  // Add a placeholder to avoid using the problematic asset
  headerBackImage: () => <View style={{ width: 1, height: 1 }} />,
});
