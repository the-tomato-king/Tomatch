import {
  BasePriceRecord,
  PriceRecord,
  BaseUserProduct,
  UserProduct,
} from "../types";
import { Unit } from "../constants/units";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { createDoc, updateOneDocInDB } from "./firebase/firebaseHelper";

/**
 * Creates a new price record for a user
 * @param {string} userId - The ID of the user
 * @param {BasePriceRecord} data - The price record data to create
 * @returns {Promise<string>} The ID of the newly created price record
 * @throws {Error} When creation fails
 * @example
 * const recordData = {
 *   user_product_id: "123",
 *   store_id: "456",
 *   original_price: "9.99",
 *   original_quantity: "2",
 *   original_unit: "kg",
 *   standard_unit_price: "4.995", // per gram
 *   currency: "$",
 *   photo_url: "https://..."
 * };
 * const recordId = await createPriceRecord("user123", recordData);
 */
export const createPriceRecord = async (
  userId: string,
  data: BasePriceRecord
): Promise<string> => {
  try {
    const priceRecordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const newRecordId = await createDoc(priceRecordPath, {
      ...data,
      recorded_at: new Date(),
    });

    if (!newRecordId) {
      throw new Error("Failed to create price record");
    }

    return newRecordId;
  } catch (error) {
    console.error("Error creating price record:", error);
    throw error;
  }
};

/**
 * Updates an existing price record
 * @param {string} userId - The ID of the user
 * @param {string} recordId - The ID of the record to update
 * @param {Partial<BasePriceRecord>} data - The data to update
 * @returns {Promise<boolean>} Whether the update was successful
 * @throws {Error} When update fails
 */
export const updatePriceRecord = async (
  userId: string,
  recordId: string,
  data: Partial<BasePriceRecord>
): Promise<boolean> => {
  try {
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    return await updateOneDocInDB(recordPath, recordId, {
      ...data,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error("Error updating price record:", error);
    throw error;
  }
};

/**
 * Retrieves a price record by its ID
 * @param {string} userId - The ID of the user
 * @param {string} recordId - The ID of the price record to retrieve
 * @returns {Promise<PriceRecord | null>} The price record if found, null otherwise
 * @throws {Error} When retrieval fails
 * @example
 * const record = await getPriceRecord("user123", "record456");
 * if (record) {
 *   console.log(record.price);
 * }
 */
export const getPriceRecord = async (
  userId: string,
  recordId: string
): Promise<PriceRecord | null> => {
  try {
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const recordRef = doc(db, recordPath, recordId);
    const recordSnap = await getDoc(recordRef);

    if (!recordSnap.exists()) {
      return null;
    }

    return {
      id: recordSnap.id,
      ...recordSnap.data(),
    } as PriceRecord;
  } catch (error) {
    console.error("Error getting price record:", error);
    throw error;
  }
};
