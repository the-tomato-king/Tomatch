import React from "react";
import { StyleSheet, TouchableOpacity, Image, Text, Alert } from "react-native";
import { colors } from "../theme/colors";
import {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import { uploadUserAvatar, deleteUserAvatar } from "../services/mediaService";
import { updateUserDocument } from "../services/userService";

interface EditAvatarProps {
  userId: string;
  avatarUrl?: string;
  userName?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export const EditAvatar = ({
  userId,
  avatarUrl,
  userName,
  onAvatarUpdate,
}: EditAvatarProps) => {
  const handleAvatarPress = () => {
    Alert.alert(
      "Change Avatar",
      "Choose avatar source",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Choose from Library",
          onPress: handleSelectFromLib,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
    }
  };

  const handleSelectFromLib = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Library permission is required to select photos"
      );
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
    }
  };

  const updateAvatar = async (imageUri: string) => {
    try {
      if (avatarUrl) {
        await deleteUserAvatar(userId);
      }

      const result = await uploadUserAvatar(userId, imageUri);
      await updateUserDocument(userId, {
        avatar_url: result.url,
      });

      onAvatarUpdate(result.url);
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar");
    }
  };

  return (
    <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{userName?.charAt(0) || "A"}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ios.systemGray6,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    color: colors.ios.secondaryLabel,
  },
});
