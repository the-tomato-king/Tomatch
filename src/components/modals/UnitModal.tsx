import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { globalStyles } from "../../theme/styles";
import DropDownPicker from "react-native-dropdown-picker";
import { USER_SELECTABLE_UNITS } from "../../constants/units";

interface UnitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (unit: string) => void;
  initialUnit: string;
}

const UnitModal = ({
  visible,
  onClose,
  onSave,
  initialUnit,
}: UnitModalProps) => {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState(initialUnit);

  const getUnitItems = () => {
    return USER_SELECTABLE_UNITS.WEIGHT;
  };

  const handleSave = () => {
    onSave(unit);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Weight Unit</Text>

          <DropDownPicker
            open={open}
            value={unit}
            items={getUnitItems()}
            setOpen={setOpen}
            setValue={setUnit}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
          />

          <View style={globalStyles.buttonsContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.primaryButton]}
              onPress={handleSave}
            >
              <Text style={globalStyles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
    borderColor: colors.lightGray2,
  },
  dropdownContainer: {
    borderColor: colors.lightGray2,
  },
  dropdownText: {
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.lightGray2,
  },
  cancelButtonText: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UnitModal;
