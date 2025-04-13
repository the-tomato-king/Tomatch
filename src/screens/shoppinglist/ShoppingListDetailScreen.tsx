import { RouteProp, useRoute } from "@react-navigation/native";
import { readOneDoc } from "../../services/firebase/firebaseHelper";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { ShoppingStackParamList } from "../../types/navigation";
import { ShoppingItem } from "./AddShoppingListScreen";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { colors } from "../../theme/colors";

type ShoppingListDetailRouteProp = RouteProp<
  ShoppingStackParamList,
  "ShoppingListDetail"
>;

export interface ShoppingListDetails {
  id: string;
  name: string;
  items: ShoppingItem[];
  shoppingTime: string;
  userId: string;
  location: {
    name: string;
    address: string;
    longitude: number;
    latitude: number;
  };
}

const ShoppingListDetailScreen = () => {
  const route = useRoute<ShoppingListDetailRouteProp>();
  const { id } = route.params;
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const navigation = useNavigation();

  const [shoppingList, setShoppingList] = useState<ShoppingListDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        if (!currentUserId) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        const docRef = doc(db, "shoppingLists", id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setLoading(false);
          return;
        }
        
        const listData = docSnap.data() as ShoppingListDetails;
        listData.id = docSnap.id;
        
        if (listData.userId !== currentUserId) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        
        setShoppingList(listData);
        if (listData.items) {
          const initialCheckedState = listData.items.reduce((acc, item) => {
            acc[item.id] = item.checked || false;
            return acc;
          }, {} as { [key: string]: boolean });
          setCheckedItems(initialCheckedState);
        }
      } catch (error) {
        console.error("Error fetching shopping list:", error);
        Alert.alert("Error", "Failed to load shopping list details");
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, [id, currentUserId]);

  useEffect(() => {
    if (shoppingList) {
      navigation.setOptions({
        title: shoppingList.name || "Detail",
      });
    }
  }, [shoppingList, navigation]);

  const handleCheck = useCallback(
    async (itemId: string) => {
      if (!shoppingList || !currentUserId) return;

      try {
        const newCheckedState = !checkedItems[itemId];

        const updatedItems = shoppingList.items.map((item) =>
          item.id === itemId ? { ...item, checked: newCheckedState } : item
        );

        await updateDoc(doc(db, "shoppingLists", id), { items: updatedItems });

        setCheckedItems((prev) => ({
          ...prev,
          [itemId]: newCheckedState,
        }));
        setShoppingList((prev) =>
          prev ? { ...prev, items: updatedItems } : prev
        );
      } catch (error) {
        console.error("Error updating checkbox:", error);
        Alert.alert("Error", "Failed to update item status");
      }
    },
    [shoppingList, checkedItems, id, currentUserId]
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (unauthorized) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          You don't have permission to view this shopping list
        </Text>
      </View>
    );
  }

  if (!shoppingList) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Shopping list not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>
        Store: {shoppingList.location?.name}
      </Text>
      <Text style={styles.dateText}>
        Shopping Time:{" "}
        {shoppingList.shoppingTime
          ? new Date(shoppingList.shoppingTime).toLocaleDateString() +
            " " +
            new Date(shoppingList.shoppingTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A"}
      </Text>

      <Text style={styles.sectionTitle}>Items:</Text>

      {shoppingList.items.length > 0 ? (
        <FlatList
          data={shoppingList.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <CheckBox
                checked={checkedItems[item.id] || false}
                onPress={() => handleCheck(item.id)}
                containerStyle={styles.checkBoxContainer}
                checkedColor="#007bff"
                uncheckedColor="#ccc"
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>
                  {item.name || "Unnamed Item"}
                </Text>
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
              </View>
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
    backgroundColor: colors.ios.systemGroupedBackground,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#007bff",
  },
  noItemsText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 6,
  },
  checkBoxContainer: {
    flex: 0,
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#666",
    marginRight: 12,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
