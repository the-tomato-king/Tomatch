import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { colors } from "../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
} from "expo-image-picker";
import { analyzeReceiptImage } from "../../services/openai/openaiService";
import AILoadingOverlay from "../../components/loading/AILoadingOverlay";
import ImagePreview from "../../components/ImagePreview";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface AnalysisResult {
  productName?: string;
  priceValue?: string;
  unitValue?: string;
  unitType?: string;
}

const MAX_TRIAL_COUNT = 3;

const AIDemoScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [image, setImage] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [trialCount, setTrialCount] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);

  const analyzeImage = async (
    imageUri: string,
    base64Data: string | undefined
  ) => {
    if (trialCount >= MAX_TRIAL_COUNT) {
      Alert.alert(
        "Trial Limit Reached",
        "Please login to continue using this feature",
        [
          {
            text: "Login",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    try {
      setIsAILoading(true);

      if (!base64Data) {
        throw new Error("Base64 image data required for analysis");
      }

      const receiptData = await analyzeReceiptImage(base64Data);
      setAnalysisResult(receiptData);
      setTrialCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Error",
        "Failed to analyze receipt image. Check console for details."
      );
    } finally {
      setIsAILoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Need camera permission to take photo");
        return;
      }

      const result = await launchCameraAsync({
        mediaTypes: "images",
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          await analyzeImage(result.assets[0].uri, result.assets[0].base64);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to take photo");
    }
  };

  const pickFromLibrary = async () => {
    try {
      const permissionResult = await requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Need photo library permission to select photo");
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        await analyzeImage(result.assets[0].uri, result.assets[0].base64 || "");
      }
    } catch (error) {
      console.error("Error selecting photo:", error);
      alert("Failed to select photo");
    }
  };

  const handleImagePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        "Change Photo",
        "Choose photo source",
        [
          {
            text: "Take Photo",
            onPress: takePhoto,
          },
          {
            text: "Choose from Library",
            onPress: pickFromLibrary,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleLoginPrompt = () => {
    Alert.alert(
      "Login Required",
      "To save this record and unlock more scans, please sign up to your account.",
      [
        {
          text: "Sign Up",
          onPress: () => navigation.navigate("Signup"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleTryAgain = () => {
    if (trialCount >= MAX_TRIAL_COUNT) {
      handleLoginPrompt();
      return;
    }
    setImage(null);
    setAnalysisResult(null);
  };

  if (isAILoading) {
    return <AILoadingOverlay imageUri={image} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.cardContainer}>
          {!image && (
            <View style={styles.guideContainer}>
              <Text style={styles.guideTitle}>How to use:</Text>
              <Text style={styles.guideText}>
                1. Take a clear photo of your receipt{"\n"}
                2. Make sure the information on the tag is clearly visible{"\n"}
                3. Try our demo image if you don't have a receipt
              </Text>
            </View>
          )}

          {image ? (
            <View style={styles.imageContainer}>
              <ImagePreview
                source={image}
                height={180}
                containerStyle={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleImagePress}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.imageContainer, styles.emptyImageContainer]}
              onPress={handleImagePress}
            >
              <View style={styles.imageContent}>
                <View style={styles.cameraIconContainer}>
                  <MaterialCommunityIcons
                    name="camera-plus-outline"
                    size={80}
                    color={colors.mediumGray}
                  />
                </View>
                <Text style={styles.uploadText}>
                  Take photo and try AI extraction
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {analysisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Analysis Result</Text>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Product:</Text>
                <Text style={styles.resultValue}>
                  {analysisResult.productName || "Not detected"}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Price:</Text>
                <Text style={styles.resultValue}>
                  ${analysisResult.priceValue || "Not detected"}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Quantity:</Text>
                <Text style={styles.resultValue}>
                  {analysisResult.unitValue || "1"}{" "}
                  {analysisResult.unitType || "EA"}
                </Text>
              </View>

              <View style={styles.actionButtonsContainer}>
                <View style={styles.trialInfoContainer}>
                  {trialCount < MAX_TRIAL_COUNT && (
                    <Text style={styles.trialCountText}>
                      {`${MAX_TRIAL_COUNT - trialCount} trials left`}
                    </Text>
                  )}
                </View>
                <View style={styles.buttonRow}>
                  {trialCount < MAX_TRIAL_COUNT && (
                    <TouchableOpacity
                      style={[styles.button, styles.tryAgainButton]}
                      onPress={handleTryAgain}
                    >
                      <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={handleLoginPrompt}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginVertical: 20,
  },
  emptyImageContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.mediumGray,
  },
  imageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    marginBottom: 15,
  },
  uploadText: {
    color: colors.darkGray,
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  editButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultContainer: {
    backgroundColor: colors.lightGray2,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.darkText,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    width: 80,
  },
  resultValue: {
    fontSize: 16,
    color: colors.darkText,
    flex: 1,
  },
  guideContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.lightGray2,
    borderRadius: 8,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.darkText,
  },
  guideText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
  },
  trialInfoContainer: {
    marginBottom: 8,
    alignItems: "center",
  },
  trialCountText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tryAgainButton: {
    backgroundColor: colors.primary,
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AIDemoScreen;
