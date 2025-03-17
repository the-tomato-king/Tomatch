import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Product } from '../types';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

interface ProductCardProps {
product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
return (
  <View>
    <View style={styles.card}>
      <Text>{product.name}</Text>
    </View>
  </View>
);
}

export default ProductCard
