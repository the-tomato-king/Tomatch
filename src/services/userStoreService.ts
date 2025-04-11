import { UserStore } from "../types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { readOneDoc } from "./firebase/firebaseHelper";

/**
 * Gets a user store by its document ID
 * @param {string} userId - The ID of the user
 * @param {string} storeId - The document ID of the store
 * @returns {Promise<UserStore | null>} The user store or null if not found
 * @example
 * const store = await getUserStoreById("user123", "store456");
 */
export const getUserStoreById = async (
  userId: string,
  storeId: string
): Promise<UserStore | null> => {
  const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;
  const storeData = await readOneDoc<UserStore>(storePath, storeId);
  return storeData;
};
