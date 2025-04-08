import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth } from '../../services/firebase/firebaseConfig'; 
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState("");

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

    // const loginHandler = () => {
    //     // go to login
    //     router.replace("login");
    //   };

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
                placeholder="Comfirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Sign Up" onPress={handleSignup} />
            {/* <Button title="Already Registered? Login" onPress={loginHandler} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
    },
});

export default SignupScreen;
