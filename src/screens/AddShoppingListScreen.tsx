import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; 
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"; 
import { createDoc } from "../services/firebase/firebaseHelper";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  checked?: boolean;
}

const AddShoppingListScreen = () => {
  const [listName, setListName] = useState<string>(""); 
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [itemName, setItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1"); 
  const [shoppingTime, setShoppingTime] = useState<Date | null>(null); 
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); 

  const handleAddItem = () => {
    if (itemName.trim().length === 0 || parseInt(quantity) <= 0) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: parseInt(quantity),
    };

    setShoppingItems((prevItems) => [...prevItems, newItem]);
    setItemName("");
    setQuantity("1");
  };

  const handleCancel = () => {
    setListName("");
    setShoppingItems([]);
    setShoppingTime(null);
    setItemName("");
    setQuantity("1");
  };

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
      shoppingTime: shoppingTime ? shoppingTime.toISOString() : null, 
      userId: null,
    };

    const docId = await createDoc("shoppingLists", shoppingListData);

    if (docId) {
      console.log("Shopping list created with ID:", docId);
    } else {
      console.error("Error creating shopping list.");
    }
  };

  const handleOpenDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        is24Hour: true,
        value: shoppingTime || new Date(),
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            setShoppingTime(selectedDate);
          } else {
            console.log("User canceled the date picker.");
          }
        },
      });
    } else {
      setShowDatePicker(true); 
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter shopping list name..."
        value={listName}
        onChangeText={setListName}
      />

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
      <TouchableOpacity
        onPress={handleOpenDatePicker}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>
          {shoppingTime
            ? shoppingTime.toLocaleString()
            : "Select Shopping Time"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && Platform.OS === "ios" && (
        <DateTimePicker
          value={shoppingTime || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === "set" && selectedDate) {
              setShoppingTime(selectedDate);
            } else {
              console.log("User canceled the date picker.");
            }
          }}
        />
      )}

      {/* TODO: location */}
      <Button title="Select Location (Coming Soon)" disabled />

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
