import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AILoadingScreen = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="robot" size={80} color={colors.primary} />
      <Text style={styles.text}>AI is analyzing your image{dots}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 100,
  },
  text: {
    fontSize: 18,
    color: colors.primary,
    marginTop: 10,
  },
});

export default AILoadingScreen;
