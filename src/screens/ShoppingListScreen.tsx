import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { deleteOneDocFromDB, readAllDocs } from '../services/firebase/firebaseHelper'; // 导入自定义的读取文档函数
import { db } from '../services/firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

type RootStackParamList = {
  ShoppingList: undefined;
  AddShoppingListScreen: undefined;
};

interface ShoppingList {
  id: string;
  name: string;
  shoppingTime: string;
}

const ShoppingListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    console.log("Deleting item with id: ", id);
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
          <View style={styles.listItem}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text>Shopping Time: {new Date(item.shoppingTime).toLocaleDateString()}</Text>
            <Button title="delete" onPress={() => handleDeleteItem(item.id)}/>
          </View>
        )}
      />
    </View>
  );
  
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    width:"100%",
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
