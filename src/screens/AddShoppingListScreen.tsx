import { useState } from "react";
import { Platform, StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { createDoc } from "../services/firebase/firebaseHelper"; // Import the createDoc function

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
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false); // Track time picker visibility

  // Function to handle opening date picker
  const handleOpenDatePicker = (type: "date" | "time") => {
    if (Platform.OS === "android") {
      if (type === "date") {
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
      } else if (type === "time") {
        DateTimePickerAndroid.open({
          mode: "time",
          is24Hour: true,
          value: shoppingTime || new Date(),
          onChange: (event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
              setShoppingTime(selectedDate);
            } else {
              console.log("User canceled the time picker.");
            }
          },
        });
      }
    } else {
      if (type === "date") {
        setShowDatePicker(true);
      } else {
        setShowTimePicker(true);
      }
    }
  };

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
      shoppingTime: shoppingTime ? shoppingTime.toISOString() : null,
      userId: null,
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
      <View style={styles.timePicker}> 
        <TouchableOpacity
          onPress={() => handleOpenDatePicker("date")}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>
            {shoppingTime
              ? shoppingTime.toLocaleDateString()
              : "Select Shopping Date"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenDatePicker("time")}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>
            {shoppingTime
              ? shoppingTime.toLocaleTimeString()
              : "Select Shopping Time"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DateTime Picker for iOS (Date and Time separately) */}
      {showDatePicker && (
        <DateTimePicker
          value={shoppingTime || new Date()}
          mode="date"
          display="spinner" // Use spinner to show the wheel picker
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

      {showTimePicker && (
        <DateTimePicker
          value={shoppingTime || new Date()}
          mode="time"
          display="spinner" // Use spinner to show the wheel picker
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (event.type === "set" && selectedDate) {
              setShoppingTime(selectedDate);
            } else {
              console.log("User canceled the time picker.");
            }
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
    padding: 8,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
    margin: 8,
  },
  dateText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  timePicker:{
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent:"center"
  }
});
