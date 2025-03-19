import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from "react-native";
import React from "react";

interface GeneralPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const GeneralPressable = ({
  children,
  onPress,
  containerStyle,
}: GeneralPressableProps) => {
  return (
    <View style={containerStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.baseStyle,
          pressed && styles.pressedStyle,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </View>
  );
};

export default GeneralPressable;

const styles = StyleSheet.create({
  baseStyle: {
    opacity: 1,
  },
  pressedStyle: {
    opacity: 0.5,
  },
});
