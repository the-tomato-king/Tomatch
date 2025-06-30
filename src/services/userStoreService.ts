import { PriceRecord, UserStore } from "../types";
import { doc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { readOneDoc } from "./firebase/firebaseHelper";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { getUserProductById } from "./userProductService";
import { NearbyStore } from "../types/location";
import { convertNearbyStoreToUserStore } from "../utils/storeConverters";

/**
 * Adds a nearby store to user's store list
 * @param {string} userId - The ID of the user
 * @param {NearbyStore} store - The nearby store to add
 * @returns {Promise<string>} The ID of the newly created store document
 * @throws {Error} When there's an error adding the store
 * @example
 * const newStoreId = await addNearbyStoreToUserStores("user123", nearbyStore);
 */
export const addNearbyStoreToUserStores = async (
  userId: string,
  store: NearbyStore
): Promise<string> => {
  try {
    const userStoresRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SUB_COLLECTIONS.USER_STORES
    );

    const docRef = await addDoc(
      userStoresRef,
      convertNearbyStoreToUserStore(store)
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding store to user's list:", error);
    throw error;
  }
};

/**
 * Deletes a store from user's store list
 * @param {string} userId - The ID of the user
 * @param {string} storeId - The ID of the store to delete
 * @returns {Promise<void>}
 * @throws {Error} When there's an error deleting the store
 * @example
 * await deleteStore("user123", "store456");
 */
export const deleteStore = async (
  userId: string,
  storeId: string
): Promise<void> => {
  const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;
  await deleteDoc(doc(db, storeDocPath));
};

/**
 * Gets a user store by its document ID
 * @param {string} userId - The ID of the user
 * @param {string} storeId - The document ID of the store
 * @returns {Promise<UserStore | null>} The user store or null if not found
 * @throws {Error} When there's an error fetching the store
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

/**
 * Gets all price records for a specific store
 * @param {string} userId - The ID of the user
 * @param {string} storeId - The ID of the store
 * @returns {Promise<PriceRecord[]>} Array of price records for the store
 * @throws {Error} When there's an error fetching the records
 * @example
 * const records = await getStorePriceRecords("user123", "store456");
 */
export const getStorePriceRecords = async (
  userId: string,
  storeId: string
): Promise<PriceRecord[]> => {
  try {
    const priceRecordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const q = query(
      collection(db, priceRecordsPath),
      where("store_id", "==", storeId)
    );

    const querySnapshot = await getDocs(q);
    const records = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userProduct = await getUserProductById(
          userId,
          data.user_product_id
        );

        return {
          id: doc.id,
          user_product_id: data.user_product_id,
          store_id: data.store_id,
          original_price: data.original_price || 0,
          original_quantity: data.original_quantity || 0,
          original_unit: data.original_unit || "",
          standard_unit_price: data.standard_unit_price || 0,
          currency: data.currency || "$",
          photo_url: data.photo_url || null,
          recorded_at: data.recorded_at?.toDate() || new Date(),
          product: userProduct
            ? {
                name: userProduct.name,
                category: userProduct.category,
              }
            : undefined,
        } as PriceRecord;
      })
    );

    return records;
  } catch (error) {
    console.error("Error fetching store price records:", error);
    throw error;
  }
};

/**
 * Toggles the favorite status of a store
 * @param {string} userId - The ID of the user
 * @param {string} storeId - The ID of the store
 * @param {boolean} isFavorite - The new favorite status
 * @returns {Promise<void>}
 * @throws {Error} When there's an error updating the store
 * @example
 * await toggleStoreFavorite("user123", "store456", true);
 */
export const toggleStoreFavorite = async (
  userId: string,
  storeId: string,
  isFavorite: boolean
): Promise<void> => {
  const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;
  await updateDoc(doc(db, storeDocPath), {
    is_favorite: isFavorite,
    updated_at: new Date(),
  });
};



