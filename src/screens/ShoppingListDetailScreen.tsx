import { RouteProp, useRoute } from '@react-navigation/native';
import { readOneDoc } from '../services/firebase/firebaseHelper';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { ShoppingStackParamList } from '../types/navigation';
import { ShoppingItem } from './AddShoppingListScreen'; 
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseConfig';

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
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const list = await readOneDoc<ShoppingListDetails>('shoppingLists', id);
        setShoppingList(list);
        if (list) {
          const initialCheckedState = list.items.reduce((acc, item) => {
            acc[item.id] = item.checked || false; // ✅ 从数据库读取 checked 状态
            return acc;
          }, {} as { [key: string]: boolean });
          setCheckedItems(initialCheckedState);
        }
      } catch (error) {
        console.error('Error fetching shopping list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, [id]);

  const handleCheck = async (itemId: string) => {
    if (!shoppingList) return;

    try {
      // 计算新的 checked 状态
      const newCheckedState = !checkedItems[itemId];

      // 更新 Firestore
      const updatedItems = shoppingList.items.map((item) =>
        item.id === itemId ? { ...item, checked: newCheckedState } : item
      );

      await updateDoc(doc(db, 'shoppingLists', id), { items: updatedItems });

      // **同步 UI 状态**
      setCheckedItems((prev) => ({
        ...prev,
        [itemId]: newCheckedState,
      }));
      setShoppingList((prev) =>
        prev ? { ...prev, items: updatedItems } : prev
      );
    } catch (error) {
      console.error('Error updating checkbox:', error);
    }
  };

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
              <CheckBox
                title={item.name} 
                checked={checkedItems[item.id] || false}  // ✅ 绑定 checkedItems[item.id]
                onPress={() => handleCheck(item.id)} 
              />
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
    flexDirection: 'row', 
    alignItems: 'center',
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
    flex: 1,
    marginLeft: 10,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#aaa',
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
