// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '../../services/firebase/firebaseConfig'; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
          const userCred = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          console.log("userCred", userCred);
        } catch (error: any) {
          Alert.alert("Error", error.message);
        }
    };
    
    const loginHandler = () => {
        navigation.navigate("Login");
    };
    
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Create a New Account</Text>
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
            <View style={{ marginTop: 20 }}>
              <Button title="Sign Up" onPress={handleSignup} />
            </View>
            <TouchableOpacity onPress={loginHandler} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Already Registered? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 32,
      color: '#333',
  },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius:12
    },
    error: {
        color: 'red',
    },
    smallButton: {
      position: 'absolute',
      bottom: 30,
      alignSelf: 'center',
    },
    smallButtonText: {
      fontSize: 14,
      color: '#007AFF',
    },
});

export default SignupScreen;