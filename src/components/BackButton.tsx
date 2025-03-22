import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type BackButtonProps = {
  screenTitle?: string;
  color?: string;
  onPress?: () => void;
};

const BackButton = ({
  screenTitle,
  color = "#4285F4",
  onPress,
}: BackButtonProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handlePress}
      accessibilityLabel="Go back"
    >
      <MaterialCommunityIcons name="chevron-left" size={30} color={color} />
      {screenTitle && (
        <Text style={[styles.backText, { color }]}>{screenTitle}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 16,
    marginLeft: -5,
  },
});

export default BackButton;
