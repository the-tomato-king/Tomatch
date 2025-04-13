import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../../theme/colors";
import { CURRENCIES } from "../../constants/currencies";

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (currency: string) => void;
  initialCurrency: string;
}

const CurrencyModal = ({
  visible,
  onClose,
  onSave,
  initialCurrency,
}: CurrencyModalProps) => {
  const [currency, setCurrency] = useState(initialCurrency);

  const handleSave = () => {
    onSave(currency);
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
          <Text style={styles.title}>Display Currency</Text>

          <ScrollView style={styles.currencyList}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyItem,
                  currency === curr.code && styles.selectedItem,
                ]}
                onPress={() => setCurrency(curr.code)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    currency === curr.code && styles.selectedText,
                  ]}
                >
                  {`${curr.code} (${curr.symbol})`}
                </Text>
                {currency === curr.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.note}>Only changes the currency display.</Text>

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
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: colors.ios.systemGray6,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: colors.ios.systemBlue,
  },
  currencyText: {
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
  note: {
    fontSize: 14,
    color: colors.ios.secondaryLabel,
    textAlign: "center",
    marginVertical: 16,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
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

export default CurrencyModal;
