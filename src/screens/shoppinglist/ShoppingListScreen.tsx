import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteOneDocFromDB } from "../../services/firebase/firebaseHelper";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ShoppingStackParamList } from "../../types/navigation";
import { db } from "../../services/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { COLLECTIONS } from "../../constants/firebase";
import { colors } from "../../theme/colors";

interface ShoppingList {
  id: string;
  name: string;
  shoppingTime: string;
  userId: string;
  location: {
    name: string;
    address: string;
    longitude: number;
    latitude: number;
  };
}

const ShoppingListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShoppingStackParamList>>();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      console.log("No user is logged in");
      return;
    }

    const shoppingListsRef = collection(db, "shoppingLists");
    const q = query(shoppingListsRef, where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ShoppingList[];
        setShoppingLists(lists);
      },
      (error) => {
        console.error("Error fetching shopping lists:", error);
        Alert.alert("Error", "Failed to load your shopping lists.");
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleDeleteItem = async (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!userId) {
              Alert.alert("Error", "You must be logged in to delete items.");
              return;
            }

            const path = `users/${userId}/shopping_lists`; 
            await deleteOneDocFromDB(path, id);
            setShoppingLists((prevState) =>
              prevState.filter((item) => item.id !== id)
            );
          } catch (error) {
            console.error("Error deleting item: ", error);
            Alert.alert("Error", "Failed to delete the shopping list.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {userId ? (
        <FlatList
          data={shoppingLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigation.navigate("ShoppingListDetail", { id: item.id })
              }
            >
              <View style={styles.itemContent}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.shoppingTime}>
                  {item.location?.name}
                </Text>
                <Text style={styles.shoppingTime}>
                  {" "}
                  {new Date(item.shoppingTime).toLocaleDateString()}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No shopping lists found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please log in to view your shopping lists</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ios.systemGroupedBackground,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 16,
    marginHorizontal:16
  },
  itemContent: {
    padding: 5,
  },
  listName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  shoppingTime: {
    fontSize: 14,
    color: "#777",
  },
  deleteButton: {
    backgroundColor: "#ff6347",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
