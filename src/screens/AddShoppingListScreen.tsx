import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Date picker for expected shopping time
import { createDoc } from "../services/firebase/firebaseHelper"; // Import the createDoc function
import { router } from "expo-router";


export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  checked?: boolean; 
}

const AddShoppingListScreen = () => {
  const [listName, setListName] = useState<string>(""); // Name of shopping list
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]); // Products in shopping list
  const [itemName, setItemName] = useState<string>(""); // Current product input
  const [quantity, setQuantity] = useState<string>("1"); // Quantity of the current product
  const [shoppingTime, setShoppingTime] = useState<Date | null>(null); // Expected shopping time
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); // Show/hide date picker

  // Function to add product to list
  const handleAddItem = () => {
    if (itemName.trim().length === 0 || parseInt(quantity) <= 0) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: parseInt(quantity),
    };

    setShoppingItems((prevItems) => [...prevItems, newItem]);
    setItemName("");
    setQuantity("1"); // Reset quantity input
  };

  // Function to cancel the creation of the shopping list
  const handleCancel = () => {
    setListName("");
    setShoppingItems([]);
    setShoppingTime(null);
    setItemName("");
    setQuantity("1");
  };

  // Function to create shopping list in the database
const handleCreateList = async () => {

  if (listName.trim().length === 0) {
    alert("Please enter a name for the shopping list.");
    return;
  }

  if (shoppingItems.length === 0) {
    alert("Please add at least one item to the shopping list.");
    return;
  }

  if (!shoppingTime) {
    alert("Please select a shopping time.");
    return;
  }

  const shoppingListData = {
    name: listName,
    items: shoppingItems,
    shoppingTime: shoppingTime ? shoppingTime.toISOString() : null, // Store time as a string
    userId: null, // Set the userId to null or a placeholder value for now
  };

  const docId = await createDoc("shoppingLists", shoppingListData);

  if (docId) {
    console.log("Shopping list created with ID:", docId);
    // Handle navigation or reset state after successful creation
  } else {
    console.error("Error creating shopping list.");
  }
};

  return (
    <View style={styles.container}>
      {/* Shopping List Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter shopping list name..."
        value={listName}
        onChangeText={setListName}
      />

      {/* Product Input */}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter product name..."
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={[styles.input, { width: 80 }]}
          placeholder="Qty"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
        <Button title="Add" onPress={handleAddItem} />
      </View>

      {/* Product List */}
      <FlatList
        data={shoppingItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.name} - {item.quantity} pcs
            </Text>
          </View>
        )}
      />

      {/* Expected Shopping Time Picker */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>
          {shoppingTime
            ? shoppingTime.toLocaleString()
            : "Select Shopping Time"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={shoppingTime || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setShoppingTime(selectedDate);
          }}
        />
      )}

      {/* TODO: Add location selection later */}
      <Button title="Select Location (Coming Soon)" disabled />

      {/* Cancel and Submit Buttons */}
      <View style={styles.buttonRow}>
        <Button title="Cancel" onPress={handleCancel} color="red" />

        <Button title="Create" onPress={handleCreateList} />
      </View>
    </View>
  );
};

export default AddShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
