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

/**
 * Creates a new user document in Firestore with default data
 * @param {string} userId - The unique identifier of the user
 * @param {string} email - The email address of the user
 * @returns {Promise<void>}
 * @throws {Error} When document creation fails or user already exists
 * @example
 * try {
 *   await createUser("user123", "user@example.com");
 *   console.log("User created successfully");
 * } catch (error) {
 *   console.error("Failed to create user:", error);
 * }
 */
export const createUser = async (
  userId: string,
  email: string
): Promise<void> => {
  try {
    const exists = await checkUserDocumentExists(userId);
    if (exists) {
      throw new Error("User already exists");
    }

    const userData = createDefaultUserData(email);
    await createUserDocument(userId, userData);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Retrieves a user's document from Firestore
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<User | null>} The user document data or null if not found
 * @throws {Error} When document retrieval fails
 * @example
 * try {
 *   const user = await getUser("user123");
 *   if (user) {
 *     console.log("User name:", user.name);
 *   }
 * } catch (error) {
 *   console.error("Failed to get user:", error);
 * }
 */
export const getUser = async (userId: string): Promise<User | null> => {
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
    console.error("Error getting user:", error);
    throw error;
  }
};

/**
 * Updates a user's document in Firestore
 * @param {string} userId - The unique identifier of the user
 * @param {Partial<BaseUser>} updates - The fields to update and their new values
 * @returns {Promise<void>}
 * @throws {Error} When document update fails or user doesn't exist
 * @example
 * try {
 *   await updateUser("user123", { name: "New Name" });
 *   console.log("User updated successfully");
 * } catch (error) {
 *   console.error("Failed to update user:", error);
 * }
 */
export const updateUser = async (
  userId: string,
  updates: Partial<BaseUser>
): Promise<void> => {
  try {
    const exists = await checkUserDocumentExists(userId);
    if (!exists) {
      throw new Error("User not found");
    }

    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userDocRef, {
      ...updates,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Deletes a user's subcollection
 * @param {string} userId - The unique identifier of the user
 * @param {string} subCollectionName - Name of the subcollection to delete
 * @returns {Promise<void>}
 */
const deleteUserSubCollection = async (
  userId: string,
  subCollectionName: string
): Promise<void> => {
  const collectionPath = `users/${userId}/${subCollectionName}`;
  const querySnapshot = await getDocs(collection(db, collectionPath));

  const deletePromises = querySnapshot.docs.map((docSnapshot) =>
    deleteDoc(doc(db, collectionPath, docSnapshot.id))
  );
  await Promise.all(deletePromises);
};

/**
 * Deletes all user-related data from Firestore
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<void>}
 * @throws {Error} When deletion fails
 * @example
 * try {
 *   await deleteUser("user123");
 *   console.log("User deleted successfully");
 * } catch (error) {
 *   console.error("Failed to delete user:", error);
 * }
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const exists = await checkUserDocumentExists(userId);
    if (!exists) {
      throw new Error("User not found");
    }

    // Delete all subcollections
    const subCollections = [
      "user_products",
      "user_stores",
      "price_records",
      "shopping_lists",
    ];

    for (const subCol of subCollections) {
      try {
        await deleteUserSubCollection(userId, subCol);
      } catch (error) {
        console.error(`Error deleting subcollection ${subCol}:`, error);
      }
    }

    // Delete main user document
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Private helper functions
const checkUserDocumentExists = async (userId: string): Promise<boolean> => {
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists();
};

const createDefaultUserData = (email: string): BaseUser => {
  return {
    name: email.split("@")[0],
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
};

const createUserDocument = async (
  userId: string,
  userData: BaseUser
): Promise<void> => {
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userDocRef, userData);
};

// Export public functions
export default {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
