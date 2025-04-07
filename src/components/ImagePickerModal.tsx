import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onUseTagImage: () => void;
  onChooseEmoji: () => void;
  onTakePhoto: () => void;
  onSelectFromLib: () => void;
}

interface OptionProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}

const ImagePickerModal = ({
  visible,
  onClose,
  onUseTagImage,
  onChooseEmoji,
  onTakePhoto,
  onSelectFromLib,
}: ImagePickerModalProps) => {
  const Option = ({ icon, label, onPress }: OptionProps) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={24} color={colors.darkGray} />
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* TODO: implement choose and use tag image */}
              {/* <Option
                icon="tag-outline"
                label="Use Tag Image"
                onPress={onUseTagImage}
              /> */}
              <Option
                icon="emoticon-outline"
                label="Choose a Emoji"
                onPress={onChooseEmoji}
              />
              <Option
                icon="camera-outline"
                label="Take a Photo"
                onPress={onTakePhoto}
              />
              <Option
                icon="image-multiple-outline"
                label="Select from Lib"
                onPress={onSelectFromLib}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default ImagePickerModal;
