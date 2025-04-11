import { PriceRecord, UserStore } from "../types";
import { doc, getDoc } from "firebase/firestore";
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
} from "firebase/firestore";
import { getUserProductById } from "./userProductService";
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

export const deleteStore = async (
  userId: string,
  storeId: string
): Promise<void> => {
  const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;
  await deleteDoc(doc(db, storeDocPath));
};
