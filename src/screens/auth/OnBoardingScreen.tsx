// src/screens/auth/OnboardingScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { ViewToken } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../theme/colors";

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to Tomatch!",
    description: "Track, compare and save with smart grocery price tracking",
    image: require("../../../assets/icon.png"),
  },
  {
    id: "2",
    title: "Quick Price Tracking 📷",
    description:
      "Snap photos of price tags to automatically record prices using AI technology",
    image: require("../../../assets/onboardingA.png"),
  },
  {
    id: "3",
    title: "Smart Comparisons 🆚",
    description:
      "Compare prices across different stores with automatic unit conversions",
    image: require("../../../assets/onboardingB.png"),
  },
  {
    id: "4",
    title: "Shopping Lists 🛒",
    description: "Create and manage your grocery lists in one place",
    image: require("../../../assets/onboardingC.png"),
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { markOnboardingComplete } = useAuth();

  const viewConfigRef = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: ViewToken[] }) => {
      if (
        info.viewableItems.length > 0 &&
        info.viewableItems[0].index !== null
      ) {
        setCurrentIndex(info.viewableItems[0].index!);
      }
    }
  ).current;

  const goToLogin = async () => {
    // Mark onboarding as complete when user navigates to login
    await markOnboardingComplete();
    navigation.navigate("Login");
  };

  const goToSignup = async () => {
    // Mark onboarding as complete when user navigates to signup
    await markOnboardingComplete();
    navigation.navigate("Signup");
  };

  const skipOnboarding = async () => {
    // Mark onboarding as complete when user skips
    await markOnboardingComplete();
    navigation.navigate("Login");
  };

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.image === "string" ? { uri: item.image } : item.image
            }
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 添加Skip按钮，只在非最后一页显示 */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity
          style={styles.skipContainer}
          onPress={() =>
            flatListRef.current?.scrollToIndex({
              index: onboardingData.length - 1,
            })
          }
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        style={styles.flatList}
      />

      <View style={styles.bottomContainer}>
        {currentIndex === onboardingData.length - 1 ? (
          <View style={styles.finalPageButtons}>
            <TouchableOpacity style={styles.signupButton} onPress={goToSignup}>
              <Text style={styles.signupButtonText}>
                Sign up to get started
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tryAIButton}
              onPress={() => (navigation as any).navigate("AIDemo")}
            >
              <Text style={styles.tryAIText}>Try AI extraction feature</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index ? styles.activeIndicator : null,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
  },
  imageContainer: {
    height: 250,
    justifyContent: "center",
    marginBottom: 40,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
  },
  bottomContainer: {
    width: "100%",
    paddingBottom: 40,
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    height: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    width: 20,
  },
  finalPageButtons: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  signupButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  tryAIButton: {
    paddingVertical: 8,
  },
  tryAIText: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  skipContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  skipText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OnboardingScreen;
