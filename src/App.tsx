import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAppData } from './services/firebase/initializeApp';
import { useEffect } from 'react';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}