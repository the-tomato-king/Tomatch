import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../theme/colors';

const loadingLogo = () => {
  return (
    <View style={[styles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default loadingLogo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});