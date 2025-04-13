import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
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
  const [unit, setUnit] = useState(initialUnit);

  const handleSave = () => {
    onSave(unit);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Select Weight Unit</Text>

          <View style={styles.unitList}>
            {USER_SELECTABLE_UNITS.WEIGHT.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.unitItem,
                  unit === item.value && styles.selectedItem,
                ]}
                onPress={() => setUnit(item.value)}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === item.value && styles.selectedText,
                  ]}
                >
                  {item.label}
                </Text>
                {unit === item.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 13,
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  unitList: {
    gap: 8,
    marginBottom: 16,
  },
  unitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: colors.ios.systemGray6,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: colors.ios.systemBlue,
  },
  unitText: {
    fontSize: 17,
    color: colors.ios.label,
  },
  selectedText: {
    color: "white",
    fontWeight: "500",
  },
  checkmark: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.ios.systemGray6,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.ios.systemBlue,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 17,
    color: colors.ios.label,
  },
  saveText: {
    fontSize: 17,
    color: "white",
    fontWeight: "600",
  },
});

export default UnitModal;
