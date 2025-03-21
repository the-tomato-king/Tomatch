import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { deleteOneDocFromDB } from '../services/firebase/firebaseHelper';
import { collection, onSnapshot } from 'firebase/firestore';
import { ShoppingStackParamList } from '../types/navigation';
import { db } from '../services/firebase/firebaseConfig';

interface ShoppingList {
  id: string;
  name: string;
  shoppingTime: string;
}

const ShoppingListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ShoppingStackParamList>>();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shoppingLists"), (snapshot) => {
      const lists = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ShoppingList[];
      setShoppingLists(lists);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteOneDocFromDB('shoppingLists', id);
      setShoppingLists((prevState) => prevState.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item: ', error);
    }
  };

  return (
    <View style={styles.container}>
    <FlatList
      data={shoppingLists}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('ShoppingListDetail', { id: item.id })}
        >
          <View style={styles.itemContent}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.shoppingTime}>
              Shopping Time: {new Date(item.shoppingTime).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
    </View>
  );
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  listItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
  },
  itemContent: {
    padding:5,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shoppingTime: {
    fontSize: 14,
    color: '#777',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
