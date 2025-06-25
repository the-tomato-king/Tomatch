import React from "react";
import { StyleSheet, TouchableOpacity, Image, Text, Alert, View } from "react-native";
import { colors } from "../theme/colors";
import {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import { uploadUserAvatar, deleteUserAvatar } from "../services/mediaService";
import { updateUser } from "../services/userService";
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
      await updateUser(userId, {
        avatar_url: result.url,
      });

      onAvatarUpdate(result.url);
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar");
    }
  };

  return (
    <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
    <View style={styles.avatar}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{userName?.charAt(0) || "A"}</Text>
      )}
    </View>
    <View style={styles.cameraIconContainer}>
      <FontAwesome name="camera" size={24} color="white" />
    </View>
  </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  avatarContainer: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ios.systemGray6,
    justifyContent: "center",
    alignItems: "center",
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
  cameraIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 50,
  },
});