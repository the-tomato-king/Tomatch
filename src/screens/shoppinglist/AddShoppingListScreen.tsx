import { useLayoutEffect, useState, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { createDoc } from "../../services/firebase/firebaseHelper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ShoppingStackParamList } from "../../types/navigation";
import ProductSearchInput from "../../components/ProductSearchInput";
import { Product } from "../../types";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  checked?: boolean;
}

export interface StoreLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const AddShoppingListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShoppingStackParamList>>();
  const route = useRoute<RouteProp<ShoppingStackParamList, "AddShoppingList">>();
  
  const [listName, setListName] = useState<string>("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [itemName, setItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [shoppingTime, setShoppingTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(null);

  // Get location from route params if available
  useEffect(() => {
    if (route.params?.selectedLocation) {
      console.log(route.params.selectedLocation)
      setSelectedLocation(route.params.selectedLocation);
    }
  }, [route.params?.selectedLocation]);
  

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
    if (itemName.trim().length === 0 || parseInt(quantity) <= 0) {
      alert("Please enter a valid product and quantity.");
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: parseInt(quantity),
    };

    setShoppingItems((prevItems) => [...prevItems, newItem]);
    setItemName("");
    setQuantity("1"); // Reset quantity input
  };

  // Function to select location
  const handleSelectLocation = () => {
    navigation.navigate("SupermarketMap");
  };

  // Function to cancel the creation of the shopping list
  const handleCancel = () => {
    setListName("");
    setShoppingItems([]);
    setShoppingTime(null);
    setItemName("");
    setQuantity("1");
    setSelectedLocation(null);
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
      location: selectedLocation || null,
    };

    const docId = await createDoc("shoppingLists", shoppingListData);

    if (docId) {
      console.log("Shopping list created with ID:", docId);
      navigation.navigate("ShoppingList");
    } else {
      console.error("Error creating shopping list.");
      alert("Failed to create shopping list. Please try again.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text
          style={[globalStyles.headerButton, { color: colors.primary }]}
          onPress={handleCreateList}
        >
          Save
        </Text>
      ),
    });
  }, [navigation, listName, shoppingItems, shoppingTime, selectedLocation]);

  return (
    <View style={styles.container}>
      {/* Shopping List Name */}
      <View style={[globalStyles.inputContainer, { marginBottom: 10 }]}>
        <View style={globalStyles.labelContainer}>
          <Text style={globalStyles.inputLabel}>Name</Text>
        </View>
        <TextInput
          style={[globalStyles.input]}
          placeholder="Enter shopping list name..."
          value={listName}
          onChangeText={setListName}
        />
      </View>

      {/* Product Input */}
      <View style={styles.row}>
        <View style={styles.productInput}>
          <ProductSearchInput
            inputValue={itemName}
            onChangeInputValue={setItemName}
            onSelectProduct={(product) => {
              setItemName(product.name);
              setSelectedProduct(product);
            }}
          />
        </View>
        <View
          style={[globalStyles.inputContainer, { width: 50, marginLeft: 10 }]}
        >
          <TextInput
            style={[globalStyles.input, { width: 80, textAlign: "center" }]}
            placeholder="Qty"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </View>
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
          style={styles.selectLocationButton}
        >
          <Text  style={styles.selectLocationText}>
            {shoppingTime
              ? shoppingTime.toLocaleDateString()
              : "Select Shopping Date"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenDatePicker("time")}
          style={styles.selectLocationButton}
        >
          <Text  style={styles.selectLocationText}>
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
          display="spinner"
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
          display="spinner"
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

      {/* Location Selection */}
      <View style={styles.locationContainer}>
        {selectedLocation ? (
          <View style={styles.selectedLocationContainer}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{selectedLocation.name}</Text>
              <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeLocationButton}
              onPress={handleSelectLocation}
            >
              <Text style={styles.changeLocationText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={handleSelectLocation}
          >
            <Text style={styles.selectLocationText}>Select Store Location</Text>
          </TouchableOpacity>
        )}
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  productInput: {
    flex: 1,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  selectLocationButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  selectLocationText: {
    color: "#1a73e8",
    fontSize: 16,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0e0f0",
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a73e8",
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  changeLocationButton: {
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 5,
  },
  changeLocationText: {
    color: "#333",
    fontWeight: "bold",
  },
});