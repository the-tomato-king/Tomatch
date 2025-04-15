import { db } from "../services/firebase/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { BaseUser, User } from "../types";
import { COLLECTIONS } from "../constants/firebase";
import { UNITS } from "../constants/units";

// Create a new user document
export const createUserDocument = async (
  userId: string,
  email: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);

    // First check if user document already exists
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log("User document already exists");
      return;
    }

    // Create initial user data with minimal required info
    const newUserData: BaseUser = {
      name: email.split("@")[0], // user email prefix as default user name
      email: email,
      phone_number: "",
      location: {
        country: "",
        province: "",
        city: "",
      },
      preferred_unit: UNITS.WEIGHT.KG,
      preferred_currency: "USD",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await setDoc(userDocRef, newUserData);
    console.log("User document created successfully");
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

// Get user document
export const getUserDocument = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

// Update user document
export const updateUserDocument = async (
  userId: string,
  updates: Partial<BaseUser>
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userDocRef, {
      ...updates,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error("Error updating user document:", error);
    throw error;
  }
};

/**
 * Deletes all user-related data from Firestore, including all subcollections and the main user document.
 * This function should be called before deleting the user's Auth account.
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<void>}
 * @throws {Error} When deletion fails at any step
 */
export async function deleteUserAndAllData(userId: string): Promise<void> {
  // List all subcollections that need to be deleted for the user
  const subCollections = [
    "user_products",
    "user_stores",
    "price_records",
    "shopping_lists",
    // Add more subcollections here if needed in the future
  ];

  // Delete all documents in each subcollection
  for (const subCol of subCollections) {
    const collectionPath = `users/${userId}/${subCol}`;
    try {
      // Get all documents in the subcollection
      const querySnapshot = await getDocs(collection(db, collectionPath));
      // Delete each document in the subcollection
      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, collectionPath, docSnapshot.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Error deleting subcollection ${subCol}:`, error);
      // Continue deleting other subcollections even if one fails
    }
  }

  // Delete the main user document
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("Error deleting main user document:", error);
    throw error;
  }
}
