// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
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
                } catch (error) {
                  Alert.alert("Error", "Failed to send verification email.");
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
      Alert.alert("Error", error.message);
    }
  };

  const signupHandler = () => {
    navigation.navigate("Signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Scalor!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {isCheckingVerification ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={signupHandler} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Forget Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signupHandler} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>New User? Create An Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#333",
  },
  input: {
    width:"100%",
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  error: {
    color: "red",
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  smallButton: {
    marginVertical: 5,
  },  
  smallButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
});

export default LoginScreen;
