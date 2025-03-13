import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { styles } from '../theme/styles'
const HomeScreen = () => {
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.title}>All Products</Text>
      </View>
    </View>
  );
}

export default HomeScreen