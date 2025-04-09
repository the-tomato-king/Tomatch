import { db } from "../services/firebase/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { BaseUser, User } from "../types";
import { COLLECTIONS } from "../constants/firebase";

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
      preferred_unit: "each",
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
