import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

interface HeaderAddButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const HeaderAddButton = ({
  onPress,
  color = colors.darkText,
  size = 24,
}: HeaderAddButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <MaterialCommunityIcons name="plus" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default HeaderAddButton;
