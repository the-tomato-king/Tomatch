// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '../../services/firebase/firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
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

    const signupHandler = () => {
        navigation.navigate('Signup');
    };

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to Scalor!</Text>
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
            <TouchableOpacity onPress={signupHandler} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>New User? Create An Account</Text>
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
      height: 48,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 12,
      paddingHorizontal: 12,
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

export default LoginScreen;