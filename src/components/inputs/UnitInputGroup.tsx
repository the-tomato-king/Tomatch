import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { UNITS, ALL_UNITS } from "../../constants/units";

interface UnitInputGroupProps {
  unitValue: string;
  unitType: string;
  onUnitValueChange: (value: string) => void;
  onUnitTypeChange: (value: string) => void;
  disabled?: boolean;
}

const UnitInputGroup: React.FC<UnitInputGroupProps> = ({
  unitValue,
  unitType,
  onUnitValueChange,
  onUnitTypeChange,
  disabled = false,
}) => {
  const [showAndroidPicker, setShowAndroidPicker] = React.useState(false);

  const handleUnitPress = () => {
    if (disabled) return;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", ...ALL_UNITS],
          cancelButtonIndex: 0,
          title: "Select Unit",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          onUnitTypeChange(ALL_UNITS[buttonIndex - 1]);
        }
      );
    } else {
      setShowAndroidPicker(true);
    }
  };

  // Android Material Design 风格的选择器
  const AndroidUnitPicker = () => (
    <Modal
      visible={showAndroidPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAndroidPicker(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowAndroidPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Unit</Text>
            <View style={styles.optionsContainer}>
              {ALL_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={styles.optionButton}
                  onPress={() => {
                    onUnitTypeChange(unit);
                    setShowAndroidPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      unitType === unit && styles.selectedOptionText,
                    ]}
                  >
                    {unit}
                  </Text>
                  {unitType === unit && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.unitValueInput}
        value={unitValue}
        onChangeText={onUnitValueChange}
        keyboardType="decimal-pad"
        placeholder="/"
        placeholderTextColor={colors.secondaryText}
      />
      <TouchableOpacity
        style={styles.unitSelector}
        onPress={handleUnitPress}
        disabled={disabled}
      >
        <Text style={styles.unitText}>{unitType}</Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={16}
          color={colors.darkText}
          style={styles.icon}
        />
      </TouchableOpacity>
      {Platform.OS === "android" && <AndroidUnitPicker />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 180,
  },
  unitValueInput: {
    backgroundColor: colors.lightGray2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 8,
    minHeight: 48,
    width: 50,
    fontSize: 16,
    textAlign: "center",
    color: colors.darkText,
  },
  unitSelector: {
    backgroundColor: colors.lightGray2,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 48,
    minWidth: 70,
  },
  unitText: {
    fontSize: 16,
    color: colors.darkText,
    marginRight: 4,
  },
  icon: {
    marginLeft: 2,
  },
  // Android Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
    padding: 16,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 20,
    color: colors.darkText,
    marginBottom: 16,
    fontWeight: "500",
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 16,
    color: colors.darkText,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "500",
  },
});

export default UnitInputGroup;
