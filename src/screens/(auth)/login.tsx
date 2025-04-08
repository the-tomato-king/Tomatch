import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth } from '../../services/firebase/firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Please fill out all fields");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

//   const signupHandler = () => {
//     router.replace("signup");
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
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Login" onPress={handleLogin} />
            {/* <Button title="New User? Create An Account" onPress={signupHandler} /> */}
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

export default LoginScreen;
