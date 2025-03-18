import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

interface ShoppingList {
  id: string;
  name: string;
}

const AddShoppingListScreen = () => {
  const [listName, setListName] = useState<string>('');
  const [newShoppingLists, setNewShoppingLists] = useState<ShoppingList[]>([]);

  const handleCreateList = () => {
    if (listName.trim().length === 0) return;

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: listName,
    };

    setNewShoppingLists((prevLists) => [...prevLists, newList]);
    setListName('');
  };

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Enter list name..."
        value={listName}
        onChangeText={setListName}
      />

      <Button title="Create List" onPress={handleCreateList} />

      <FlatList
        data={newShoppingLists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.listItem}>{item.name}</Text>}
      />
    </View>
  );
};

export default AddShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
