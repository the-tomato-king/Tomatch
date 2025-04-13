import {
  BasePriceRecord,
  PriceRecord,
  BaseUserProduct,
  UserProduct,
} from "../types";
import { Unit, isCountUnit } from "../constants/units";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  createDoc,
  updateOneDocInDB,
  deleteOneDocFromDB,
  readOneDoc,
} from "./firebase/firebaseHelper";
import {
  getUserProductPriceRecords,
  getUserProductById,
} from "./userProductService";
import { deleteProductImage } from "./mediaService";

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
    // 1. get the original record
    const originalRecord = await getPriceRecord(userId, recordId);
    if (!originalRecord) {
      throw new Error("Record not found");
    }

    // 2. update the record
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const success = await updateOneDocInDB(recordPath, recordId, {
      ...data,
      updated_at: new Date(),
    });

    if (!success) {
      throw new Error("Failed to update price record");
    }

    // 3. get the user product
    const userProduct = await getUserProductById(
      userId,
      originalRecord.user_product_id
    );

    if (!userProduct) {
      throw new Error("User product not found");
    }

    // 4. determine the measurement type of the record (use the updated unit if it exists)
    const measurementType = isCountUnit(
      data.original_unit || originalRecord.original_unit
    )
      ? "count"
      : "measurable";

    // 5. get all records of the product
    const priceRecords = await getUserProductPriceRecords(
      userId,
      originalRecord.user_product_id
    );

    // 6. recalculate the stats
    const updatedStats: Record<string, any> = {
      [measurementType]: null,
    };

    // calculate the stats for the current record type
    priceRecords.forEach((record: PriceRecord) => {
      const recordType = isCountUnit(record.original_unit)
        ? "count"
        : "measurable";

      // only process the data for the current record type
      if (recordType === measurementType) {
        if (!updatedStats[measurementType]) {
          updatedStats[measurementType] = {
            total_price: 0,
            average_price: 0,
            lowest_price: Infinity,
            highest_price: -Infinity,
            lowest_price_store: null,
            total_price_records: 0,
          };
        }

        const price = parseFloat(
          record.id === recordId && data.standard_unit_price
            ? data.standard_unit_price
            : record.standard_unit_price
        );

        updatedStats[measurementType].total_price += price;
        updatedStats[measurementType].total_price_records += 1;

        if (price < updatedStats[measurementType].lowest_price) {
          updatedStats[measurementType].lowest_price = price;
          updatedStats[measurementType].lowest_price_store = {
            store_id: record.store_id,
            store_name: record.store?.name || "",
          };
        }
        if (price > updatedStats[measurementType].highest_price) {
          updatedStats[measurementType].highest_price = price;
        }
      }
    });

    // calculate the average price
    if (updatedStats[measurementType]) {
      updatedStats[measurementType].average_price =
        updatedStats[measurementType].total_price /
        updatedStats[measurementType].total_price_records;
    }

    // 8. if the unit type changed, update measurement_types
    let updatedMeasurementTypes = [...userProduct.measurement_types];
    const originalType = isCountUnit(originalRecord.original_unit)
      ? "count"
      : "measurable";
    const newType = isCountUnit(
      data.original_unit || originalRecord.original_unit
    )
      ? "count"
      : "measurable";

    let displayPreference: string | null = null; // use a temporary variable to store display_preference

    if (data.original_unit && originalType !== newType) {
      // check if there are other records using the original type
      const hasOtherRecordsOfOriginalType = priceRecords.some((record: PriceRecord) => {
        return (
          record.id !== recordId &&
          (isCountUnit(record.original_unit) ? "count" : "measurable") ===
            originalType
        );
      });

      // if there are no other records using the original type, then:
      // 1. remove the original type from measurement_types
      // 2. set the corresponding price_statistics to null
      if (!hasOtherRecordsOfOriginalType) {
        updatedMeasurementTypes = updatedMeasurementTypes.filter(
          (t) => t !== originalType
        );
        updatedStats[originalType] = null;

        // if the current display_preference is the original type, update it to the new type
        if (userProduct.display_preference === originalType) {
          displayPreference = newType;
        }
      }

      // add the new type (if it doesn't exist yet)
      if (!updatedMeasurementTypes.includes(newType)) {
        updatedMeasurementTypes.push(newType);
        // if the display_preference is not set, set it to the new type
        if (!userProduct.display_preference) {
          displayPreference = newType;
        }
      }
    }

    // 9. update the user product
    let updateData: any = {};

    updateData = {
      measurement_types: updatedMeasurementTypes,
      [`price_statistics.${originalType}`]: updatedStats[originalType],
      [`price_statistics.${newType}`]: updatedStats[newType],
      ...(displayPreference && { display_preference: displayPreference }),
      updated_at: new Date(),
    };

    await updateOneDocInDB(
      `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`,
      originalRecord.user_product_id,
      updateData
    );

    return true;
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

/**
 * Deletes a single price record and its associated image
 * @param {string} userId - The ID of the user
 * @param {string} recordId - The ID of the record to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 * @throws {Error} When deletion fails
 */
export const deletePriceRecord = async (
  userId: string,
  recordId: string
): Promise<boolean> => {
  try {
    // 1. Get the record to get the image path
    const record = await getPriceRecord(userId, recordId);
    if (!record) {
      throw new Error("Record not found");
    }

    // 2. Delete the image if exists
    if (record.photo_url) {
      try {
        await deleteProductImage(record.photo_url);
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue with record deletion even if image deletion fails
      }
    }

    // 3. Delete the record
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    return await deleteOneDocFromDB(recordPath, recordId);
  } catch (error) {
    console.error("Error deleting price record:", error);
    throw error;
  }
};

/**
 * Updates a product's statistics based on its current records
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateProductStats = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
    const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

    // 1. Get the product
    const userProduct = await readOneDoc<UserProduct>(
      userProductPath,
      productId
    );
    if (!userProduct) {
      throw new Error("User product not found");
    }

    // 2. Get all records of the product
    const recordsQuery = query(
      collection(db, recordsPath),
      where("user_product_id", "==", productId)
    );
    const recordsSnapshot = await getDocs(recordsQuery);

    // 3. Calculate stats for each measurement type
    type MeasurementType = "count" | "measurable";
    type StatsType = {
      records: number;
      total: number;
      lowest: number;
      highest: number;
      lowestPriceStore: null | { store_id: string; store_name: string };
    };

    const stats: Record<MeasurementType, StatsType> = {
      count: {
        records: 0,
        total: 0,
        lowest: Infinity,
        highest: -Infinity,
        lowestPriceStore: null,
      },
      measurable: {
        records: 0,
        total: 0,
        lowest: Infinity,
        highest: -Infinity,
        lowestPriceStore: null,
      },
    };

    const measurementTypes = new Set<MeasurementType>();

    recordsSnapshot.docs.forEach((doc) => {
      const record = doc.data() as PriceRecord;
      const type = isCountUnit(record.original_unit) ? "count" : "measurable";
      const price = parseFloat(record.standard_unit_price);

      measurementTypes.add(type);
      stats[type].records++;
      stats[type].total += price;

      if (price < stats[type].lowest) {
        stats[type].lowest = price;
        stats[type].lowestPriceStore = {
          store_id: record.store_id,
          store_name: record.store?.name || "",
        };
      }
      if (price > stats[type].highest) {
        stats[type].highest = price;
      }
    });

    // 4. Prepare the update data
    const updateData: any = {
      measurement_types: Array.from(measurementTypes),
      updated_at: new Date(),
    };

    // Add stats for each type that has records
    (["count", "measurable"] as const).forEach((type: MeasurementType) => {
      if (stats[type].records > 0) {
        updateData[`price_statistics.${type}`] = {
          total_price: stats[type].total,
          average_price: stats[type].total / stats[type].records,
          lowest_price:
            stats[type].lowest === Infinity ? 0 : stats[type].lowest,
          highest_price:
            stats[type].highest === -Infinity ? 0 : stats[type].highest,
          lowest_price_store: stats[type].lowestPriceStore,
          total_price_records: stats[type].records,
        };
      } else {
        updateData[`price_statistics.${type}`] = null;
      }
    });

    // If current display_preference type has no records, clear it
    if (
      userProduct.display_preference &&
      stats[userProduct.display_preference].records === 0
    ) {
      updateData.display_preference = null;
    }

    // 5. Update the product
    return await updateOneDocInDB(userProductPath, productId, updateData);
  } catch (error) {
    console.error("Error updating product stats:", error);
    throw error;
  }
};

/**
 * Deletes a price record and updates the associated product statistics
 * @param {string} userId - The ID of the user
 * @param {string} recordId - The ID of the record to delete
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const deletePriceRecordAndUpdateStats = async (
  userId: string,
  recordId: string
): Promise<boolean> => {
  try {
    // 1. Get the record to get the product ID
    const record = await getPriceRecord(userId, recordId);
    if (!record) {
      throw new Error("Record not found");
    }

    // 2. Delete the record and its image
    await deletePriceRecord(userId, recordId);

    // 3. Update the product stats
    await updateProductStats(userId, record.user_product_id);

    return true;
  } catch (error) {
    console.error("Error in deletePriceRecordAndUpdateStats:", error);
    throw error;
  }
};
