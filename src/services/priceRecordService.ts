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
  deleteUserProduct,
  updateUserProductStats,
} from "./userProductService";

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
    // 1. 获取原始记录
    const originalRecord = await getPriceRecord(userId, recordId);
    if (!originalRecord) {
      throw new Error("Record not found");
    }

    // 2. 更新记录
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const success = await updateOneDocInDB(recordPath, recordId, {
      ...data,
      updated_at: new Date(),
    });

    if (!success) {
      throw new Error("Failed to update price record");
    }

    // 3. 获取用户产品
    const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
    const userProduct = await readOneDoc<UserProduct>(
      userProductPath,
      originalRecord.user_product_id
    );

    if (!userProduct) {
      throw new Error("User product not found");
    }

    // 4. 确定记录的测量类型（使用更新后的单位，如果有的话）
    const measurementType = isCountUnit(
      data.original_unit || originalRecord.original_unit
    )
      ? "count"
      : "measurable";

    // 5. 获取该产品的所有记录
    const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const recordsQuery = query(
      collection(db, recordsPath),
      where("user_product_id", "==", originalRecord.user_product_id)
    );
    const recordsSnapshot = await getDocs(recordsQuery);

    // 6. 重新计算统计信息
    let totalRecords = 0;
    let totalPrice = 0;
    let lowestPrice = Infinity;
    let highestPrice = -Infinity;
    let lowestPriceStore =
      userProduct.price_statistics[measurementType]?.lowest_price_store;

    recordsSnapshot.docs.forEach((doc) => {
      const recordData = doc.data() as PriceRecord;
      const recordMeasurementType = isCountUnit(recordData.original_unit)
        ? "count"
        : "measurable";

      if (recordMeasurementType === measurementType) {
        totalRecords++;
        // 如果是当前正在更新的记录，使用新的价格
        const price =
          doc.id === recordId && data.standard_unit_price
            ? parseFloat(data.standard_unit_price)
            : parseFloat(recordData.standard_unit_price);

        totalPrice += price;

        if (price < lowestPrice) {
          lowestPrice = price;
          lowestPriceStore = {
            store_id: recordData.store_id,
            store_name: recordData.store?.name || "",
          };
        }
        if (price > highestPrice) {
          highestPrice = price;
        }
      }
    });

    // 7. 更新用户产品统计信息
    const updatedStats = {
      total_price: totalPrice,
      average_price: totalPrice / totalRecords,
      lowest_price: lowestPrice === Infinity ? 0 : lowestPrice,
      highest_price: highestPrice === -Infinity ? 0 : highestPrice,
      lowest_price_store: lowestPriceStore,
      total_price_records: totalRecords,
    };

    // 8. 如果单位类型改变了，需要更新 measurement_types
    let updatedMeasurementTypes = [...userProduct.measurement_types];
    const originalType = isCountUnit(originalRecord.original_unit)
      ? "count"
      : "measurable";

    if (data.original_unit && originalType !== measurementType) {
      // 移除旧类型（如果没有其他记录使用这个类型）
      const hasOtherRecordsOfOriginalType = recordsSnapshot.docs.some((doc) => {
        const record = doc.data() as PriceRecord;
        return (
          doc.id !== recordId &&
          (isCountUnit(record.original_unit) ? "count" : "measurable") ===
            originalType
        );
      });

      if (!hasOtherRecordsOfOriginalType) {
        updatedMeasurementTypes = updatedMeasurementTypes.filter(
          (t) => t !== originalType
        );
      }

      // 添加新类型（如果还没有）
      if (!updatedMeasurementTypes.includes(measurementType)) {
        updatedMeasurementTypes.push(measurementType);
      }
    }

    // 9. 更新用户产品
    await updateOneDocInDB(userProductPath, originalRecord.user_product_id, {
      measurement_types: updatedMeasurementTypes,
      [`price_statistics.${measurementType}`]: updatedStats,
      updated_at: new Date(),
    });

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
 * Deletes a price record and updates the associated user product statistics
 * @param {string} userId - The ID of the user
 * @param {string} recordId - The ID of the record to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 * @throws {Error} When deletion fails
 */
export const deletePriceRecordAndUpdateStats = async (
  userId: string,
  recordId: string
): Promise<boolean> => {
  try {
    // 1. get the record to delete
    const record = await getPriceRecord(userId, recordId);
    if (!record) {
      throw new Error("Record not found");
    }

    const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
    const userProduct = await readOneDoc<UserProduct>(
      userProductPath,
      record.user_product_id
    );

    if (!userProduct) {
      throw new Error("User product not found");
    }

    // 2. determine the measurement type of the record
    const measurementType = isCountUnit(record.original_unit)
      ? "count"
      : "measurable";
    const currentStats = userProduct.price_statistics[measurementType];

    if (!currentStats) {
      throw new Error("Statistics not found for measurement type");
    }

    // 3. get all records of the product (except the one to delete)
    const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
    const recordsQuery = query(
      collection(db, recordsPath),
      where("user_product_id", "==", record.user_product_id)
    );
    const recordsSnapshot = await getDocs(recordsQuery);

    // 4. recalculate the stats
    let remainingRecordsOfType = 0;
    let totalPrice = 0;
    let lowestPrice = Infinity;
    let highestPrice = -Infinity;
    let lowestPriceStore = currentStats.lowest_price_store;

    recordsSnapshot.docs.forEach((doc) => {
      if (doc.id !== recordId) {
        // skip the record to delete
        const recordData = doc.data() as PriceRecord;
        const recordMeasurementType = isCountUnit(recordData.original_unit)
          ? "count"
          : "measurable";

        if (recordMeasurementType === measurementType) {
          remainingRecordsOfType++;
          const price = parseFloat(recordData.standard_unit_price);
          totalPrice += price;

          if (price < lowestPrice) {
            lowestPrice = price;
            lowestPriceStore = {
              store_id: recordData.store_id,
              store_name: recordData.store?.name || "",
            };
          }
          if (price > highestPrice) {
            highestPrice = price;
          }
        }
      }
    });

    // 5. update the user product
    const updatedMeasurementTypes = [...userProduct.measurement_types];

    // if this is the last record of this type, remove it from measurement_types
    if (remainingRecordsOfType === 0) {
      const index = updatedMeasurementTypes.indexOf(measurementType);
      if (index > -1) {
        updatedMeasurementTypes.splice(index, 1);
      }
    }

    const updatedStats =
      remainingRecordsOfType === 0
        ? null
        : {
            total_price: totalPrice,
            average_price: totalPrice / remainingRecordsOfType,
            lowest_price: lowestPrice === Infinity ? 0 : lowestPrice,
            highest_price: highestPrice === -Infinity ? 0 : highestPrice,
            lowest_price_store: lowestPriceStore,
            total_price_records: remainingRecordsOfType,
          };

    // 6. update the user product
    await updateOneDocInDB(userProductPath, record.user_product_id, {
      measurement_types: updatedMeasurementTypes,
      [`price_statistics.${measurementType}`]: updatedStats,
      // if the current display preference is the deleted type and there are no records of this type, clear the display preference
      ...(userProduct.display_preference === measurementType &&
      remainingRecordsOfType === 0
        ? { display_preference: undefined }
        : {}),
      updated_at: new Date(),
    });

    // 7. delete the record
    const success = await deleteOneDocFromDB(recordsPath, recordId);
    if (!success) {
      throw new Error("Failed to delete price record");
    }

    return true;
  } catch (error) {
    console.error("Error deleting price record and updating stats:", error);
    throw error;
  }
};
