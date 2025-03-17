import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { testFirestoreConnection } from '../services/firebase/test';


const HomeScreen = () => {
  // useEffect(() => {
  //   testFirestoreConnection();
  // }, []); 
  
  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})

