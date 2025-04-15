// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { auth } from "../../services/firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

// Custom error messages for common Firebase Auth error codes
const ERROR_MESSAGES: { [key: string]: string } = {
  "auth/invalid-email": "The email address is badly formatted.",
  "auth/user-disabled": "This user account has been disabled.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Please check your internet connection.",
  "auth/invalid-credential":
    "Invalid email or password. Please check your credentials.",
  // Add more error codes and messages as needed
};

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  const checkVerificationStatus = async (user: any) => {
    try {
      await user.reload();
      return user.emailVerified;
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Please fill out all fields");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      if (!userCred.user.emailVerified) {
        await signOut(auth);

        Alert.alert(
          "Email Not Verified",
          "Please check your email and click the verification link we sent you.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  await sendEmailVerification(userCred.user);
                  Alert.alert(
                    "Success",
                    "Verification email sent. Please check your inbox and spam folder."
                  );
                } catch (error: any) {
                  console.error("Resend verification error code:", error.code);
                  console.error(
                    "Resend verification error message:",
                    error.message
                  );

                  Alert.alert(
                    "Error",
                    `Failed to send verification email.\n${error.message || ""}`
                  );
                }
              },
            },
            {
              text: "I've Verified",
              onPress: async () => {
                setIsCheckingVerification(true);
                const isVerified = await checkVerificationStatus(userCred.user);
                setIsCheckingVerification(false);

                if (isVerified) {
                  handleLogin();
                } else {
                  Alert.alert(
                    "Not Verified",
                    "Your email is still not verified. Please check your email and click the verification link."
                  );
                }
              },
            },
            { text: "OK" },
          ]
        );
        return;
      }
    } catch (error: any) {
      // Log error code and message for debugging purposes
      console.log("Login error code:", error.code);
      console.log("Login error message:", error.message);

      // Use custom error message if available, otherwise fallback to the original message
      const errorMessage =
        (error.code && ERROR_MESSAGES[error.code]) ||
        error.message ||
        "Login failed. Please try again.";

      Alert.alert("Error", errorMessage);
    }
  };

  const signupHandler = () => {
    navigation.navigate("Signup");
  };

  const forgetPasswordHandler = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Let's get started</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isCheckingVerification}
              >
                {isCheckingVerification ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
              <TouchableOpacity
                onPress={forgetPasswordHandler}
                style={styles.textButton}
              >
                <Text style={styles.textButtonText}>Forgot Password?</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={signupHandler}
                  style={styles.textButton}
                >
                  <Text
                    style={[styles.textButtonText, styles.signupButtonText]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1a1a1a",
  },
  loginButton: {
    height: 52,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomContainer: {
    alignItems: "center",
  },
  textButton: {
    padding: 8,
  },
  textButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
    marginRight: 4,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signupButton: {
    padding: 8,
    borderRadius: 12,
  },
});

export default LoginScreen;
