import { RouteProp, useRoute } from '@react-navigation/native';
import { readOneDoc } from '../services/firebase/firebaseHelper';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { ShoppingStackParamList } from '../types/navigation';
import { ShoppingItem } from './AddShoppingListScreen';

type ShoppingListDetailRouteProp = RouteProp<ShoppingStackParamList, 'ShoppingListDetail'>;

export interface ShoppingListDetails {
  id: string;
  name: string;
  items: ShoppingItem[]; 
  shoppingTime: string;
}

const ShoppingListDetailScreen = () => {
  const route = useRoute<ShoppingListDetailRouteProp>();
  const { id } = route.params;

  const [shoppingList, setShoppingList] = useState<ShoppingListDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const list = await readOneDoc<ShoppingListDetails>('shoppingLists', id);
        setShoppingList(list);
      } catch (error) {
        console.error('Error fetching shopping list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!shoppingList) {
    return <Text style={styles.errorText}>Shopping list not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{shoppingList.name}</Text>
      <Text style={styles.dateText}>
        Shopping Time: {new Date(shoppingList.shoppingTime).toLocaleString()}
      </Text>

      <Text style={styles.sectionTitle}>Items:</Text>

      {shoppingList.items.length > 0 ? (
        <FlatList
          data={shoppingList.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noItemsText}>No items in this shopping list</Text>
      )}
    </View>
  );
};

export default ShoppingListDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#007bff',
  },
  itemContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
  },
  noItemsText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
