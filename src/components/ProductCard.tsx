import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Product } from '../types';
import { styles } from '../theme/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';

type ProductNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "Home"
>;

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigation = useNavigation<ProductNavigationProp>();
  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product.product_id });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
    <View style={styles.card}>
      <Text>{product.name}</Text>
    </View>
  </TouchableOpacity>
);
}

export default ProductCard
