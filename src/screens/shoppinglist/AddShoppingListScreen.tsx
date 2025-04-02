import { useLayoutEffect, useState, useEffect, useCallback } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
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
import * as Notifications from "expo-notifications";

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

  const handleStoreSelect = useCallback((storeData: StoreLocation) => {
    setSelectedLocation(storeData);
  }, []);

  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  
    // Set up Android channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('shopping-reminders', {
        name: 'Shopping Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    // Request permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications was denied.");
      }
    };
    requestPermissions();
    
    // ONLY add these listeners if you need to respond to notifications 
    // while the app is open - they can be moved to a separate component 
    // or commented out during development
    /*
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });
  
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
    */
  }, []);

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
    navigation.navigate("SupermarketMap", {
      onSelectStore: handleStoreSelect
    });
  };

  const scheduleNotification = async (shoppingTime: Date) => {
    try {
        const now = new Date();
        
        // Make sure we're comparing valid dates
        if (!shoppingTime || isNaN(shoppingTime.getTime())) {
            console.log("Invalid shopping time provided");
            return false;
        }
        
        // Calculate time difference in milliseconds, then convert to seconds
        const timeDiff = Math.max(
            Math.floor((shoppingTime.getTime() - now.getTime()) / 1000),
            1 // Ensure at least 1 second in the future
        );
        
        // Add validation to prevent past notifications
        if (timeDiff <= 0) {
            console.log("Cannot schedule notification for past time");
            return false;
        }
        
        // Log the exact time being scheduled
        console.log("Scheduling notification for:", shoppingTime.toLocaleString());
        console.log("Current time:", now.toLocaleString());
        console.log("Time difference in seconds:", timeDiff);
        
        // Cancel any existing notifications before scheduling a new one
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // Schedule the new notification
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Shopping Reminder 🛒",
            body: `Don't forget to go shopping today! (${shoppingTime.toLocaleTimeString()})`,
            sound: "default",
            data: {
              type: "shopping_reminder",
              scheduledFor: shoppingTime.toISOString(),
            },
          },
          trigger: {
            seconds: timeDiff,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            repeats: false,
          } as Notifications.TimeIntervalTriggerInput,
        });

        console.log(`Notification scheduled with ID ${identifier} for:`, shoppingTime.toLocaleString());
        return true;
    } catch (error) {
        console.error("Error scheduling notification:", error);
        return false;
    }
};

  // Function to save shopping list after notification confirmation
  const saveShoppingList = async (setNotification: boolean) => {
    const shoppingListData = {
      name: listName,
      items: shoppingItems,
      shoppingTime: shoppingTime ? shoppingTime.toISOString() : null,
      userId: null,
      location: selectedLocation || null,
      notification: setNotification ? true : false,
    };

    const docId = await createDoc("shoppingLists", shoppingListData);

    if (docId) {
      console.log("Shopping list created with ID:", docId);
      
      if (setNotification && shoppingTime) {
        const scheduledSuccessfully = await scheduleNotification(shoppingTime);
        if (scheduledSuccessfully) {
            console.log("Notification scheduled for:", shoppingTime.toLocaleString());
        } else {
            console.log("Failed to schedule notification");
        }
    }
      
      navigation.navigate("ShoppingList");
    } else {
      console.error("Error creating shopping list.");
      alert("Failed to create shopping list. Please try again.");
    }
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

    // Ask user about notification
    Alert.alert(
      "Shopping Reminder", 
      `Would you like to receive a reminder notification on ${shoppingTime.toLocaleDateString()}?`, 
      [
        {
          text: "No", 
          onPress: () => saveShoppingList(false),
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: () => saveShoppingList(true)
        }
      ],
      { cancelable: false }
    );
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