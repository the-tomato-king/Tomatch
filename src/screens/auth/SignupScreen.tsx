// src/screens/auth/SignupScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { auth } from "../../services/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { createUserDocument } from "../../services/userService";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignup = async () => {
    if (email === "" || password === "" || confirmPassword === "") {
      Alert.alert("Please fill out all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    try {
      // 1. Create authentication user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Send verification email
      await sendEmailVerification(userCred.user);

      // 3. Create user document in Firestore
      await createUserDocument(userCred.user.uid, email);

      // 4. 登出用户，等待邮箱验证
      await signOut(auth);

      // 5. Show success message with verification instructions
      Alert.alert(
        "Verification Required",
        "A verification email has been sent to your email address. Please verify your email before logging in.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const loginHandler = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <TouchableOpacity onPress={loginHandler} style={styles.smallButton}>
        <Text style={styles.smallButtonText}>Already Registered? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  error: {
    color: "red",
  },
  smallButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  smallButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
});

export default SignupScreen;
