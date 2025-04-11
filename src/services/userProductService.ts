import {
  BaseUserProduct,
  UserProduct,
  PriceRecord,
  ImageType,
  MeasurementType,
  PriceStatistics,
} from "../types";
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import {
  createDoc,
  updateOneDocInDB,
  deleteOneDocFromDB,
} from "./firebase/firebaseHelper";
import { uploadProductImage } from "./mediaService";

interface ListenToUserProductResult {
  userProduct: UserProduct | null;
  productExists: boolean;
  error?: Error;
}

/**
 * Sets up a real-time listener for a user product
 * @param {string} userId - The ID of the user
 * @param {string} userProductId - The ID of the user product to listen to
 * @param {function} onUpdate - Callback function that receives updates
 * @returns {function} Unsubscribe function to stop listening
 * @example
 * const unsubscribe = listenToUserProduct("user123", "product456", (result) => {
 *   if (result.productExists) {
 *     console.log(result.userProduct);
 *   }
 * });
 *
 * // Later: stop listening
 * unsubscribe();
 */
export const listenToUserProduct = (
  userId: string,
  userProductId: string,
  onUpdate: (result: ListenToUserProductResult) => void
): (() => void) => {
  const userProductsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

  const unsubscribe = onSnapshot(
    doc(db, userProductsPath, userProductId),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        onUpdate({
          userProduct: {
            id: doc.id,
            ...data,
          } as UserProduct,
          productExists: true,
        });
      } else {
        onUpdate({
          userProduct: null,
          productExists: false,
        });
      }
    },
    (error) => {
      console.error("Error listening to user product:", error);
      onUpdate({
        userProduct: null,
        productExists: false,
        error: error as Error,
      });
    }
  );

  return unsubscribe;
};

export interface BasicProductData {
  name: string;
  category: string;
  image_type: ImageType;
  plu_code: string;
  image_source: string;
  barcode: string;
}

interface CreateUserProductParams {
  userId: string;
  productData: BasicProductData;
  localImageUri?: string;
}

/**
 * Creates a new user product with optional image upload
 * @param {CreateUserProductParams} params - The parameters for creating a user product
 * @param {string} params.userId - The ID of the user
 * @param {BasicProductData} params.productData - Basic product information
 * @param {string} [params.localImageUri] - Optional URI of a local image to upload
 * @returns {Promise<string>} The ID of the newly created user product
 * @throws {Error} When creation or image upload fails
 * @example
 * const productId = await createUserProduct({
 *   userId: "user123",
 *   productData: {
 *     name: "Apple",
 *     category: "Fruits",
 *     image_type: "emoji",
 *     plu_code: "4131",
 *     image_source: "🍎",
 *     barcode: ""
 *   },
 *   localImageUri: "file:///path/to/image.jpg"
 * });
 */
export const createUserProduct = async ({
  userId,
  productData,
  localImageUri,
}: CreateUserProductParams): Promise<string> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

  let finalImageSource = productData.image_source;
  if (localImageUri && productData.image_type === "user_image") {
    const result = await uploadProductImage(userId, localImageUri);
    finalImageSource = result.url;
  }

  const userProductToSave: BaseUserProduct = {
    ...productData,
    image_source: finalImageSource,
    measurement_types: [],
    price_statistics: {
      measurable: {
        total_price: 0,
        average_price: 0,
        lowest_price: 0,
        highest_price: 0,
        lowest_price_store: {
          store_id: "",
          store_name: "",
        },
        total_price_records: 0,
      },
      count: {
        total_price: 0,
        average_price: 0,
        lowest_price: 0,
        highest_price: 0,
        lowest_price_store: {
          store_id: "",
          store_name: "",
        },
        total_price_records: 0,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const newProductId = await createDoc(userProductPath, userProductToSave);
  if (!newProductId) {
    throw new Error("Failed to create user product");
  }

  return newProductId;
};

interface UpdateUserProductParams {
  userId: string;
  productId: string;
  productData: BasicProductData;
  localImageUri?: string;
}

/**
 * Updates an existing user product
 * @param {UpdateUserProductParams} params - The parameters for updating a user product
 * @param {string} params.userId - The ID of the user
 * @param {string} params.productId - The ID of the product to update
 * @param {BasicProductData} params.productData - Updated product information
 * @param {string} [params.localImageUri] - Optional URI of a new image to upload
 * @returns {Promise<void>}
 * @throws {Error} When update or image upload fails
 * @example
 * await updateUserProduct({
 *   userId: "user123",
 *   productId: "product456",
 *   productData: {
 *     name: "Green Apple",
 *     category: "Fruits",
 *     image_type: "emoji",
 *     plu_code: "4132",
 *     image_source: "🍏",
 *     barcode: ""
 *   }
 * });
 */
export const updateUserProduct = async ({
  userId,
  productId,
  productData,
  localImageUri,
}: UpdateUserProductParams): Promise<void> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

  let finalImageSource = productData.image_source;
  if (localImageUri && productData.image_type === "user_image") {
    const result = await uploadProductImage(userId, localImageUri);
    finalImageSource = result.url;
  }

  const userProductToUpdate: Partial<BaseUserProduct> = {
    ...productData,
    image_source: finalImageSource,
    updated_at: new Date(),
  };

  await updateOneDocInDB(userProductPath, productId, userProductToUpdate);
};

/**
 * Deletes a user product and all its related price records
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product to delete
 * @returns {Promise<void>}
 * @throws {Error} When deletion fails
 * @example
 * await deleteUserProduct("user123", "product456");
 */
export const deleteUserProduct = async (
  userId: string,
  productId: string
): Promise<void> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
  const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

  // 1. Delete all related price records
  const recordsQuery = query(
    collection(db, recordsPath),
    where("user_product_id", "==", productId)
  );
  const recordsSnapshot = await getDocs(recordsQuery);

  // Delete each record
  const recordDeletePromises = recordsSnapshot.docs.map((doc) =>
    deleteOneDocFromDB(recordsPath, doc.id)
  );
  await Promise.all(recordDeletePromises);

  // 2. Delete the user product
  await deleteOneDocFromDB(userProductPath, productId);
};

/**
 * Finds a user product by its name
 * @param {string} userId - The ID of the user
 * @param {string} productName - The name of the product to find
 * @returns {Promise<UserProduct & { id: string } | undefined>}
 */
export const findUserProductByName = async (
  userId: string,
  productName: string
): Promise<(UserProduct & { id: string }) | undefined> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
  const existingProducts = await getDocs(
    query(collection(db, userProductPath), where("name", "==", productName))
  );

  if (!existingProducts.empty) {
    const doc = existingProducts.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as UserProduct & { id: string };
  }
  return undefined;
};

/**
 * Gets a user product by its document ID in user_products collection
 * @param {string} userId - The ID of the user
 * @param {string} userProductId - The document ID in user_products collection
 * @returns {Promise<UserProduct & { id: string } | undefined>}
 * @example
 * // Get user product using its document ID
 * const userProduct = await getUserProductById("user123", "userProduct456");
 */
export const getUserProductById = async (
  userId: string,
  userProductId: string
): Promise<(UserProduct & { id: string }) | undefined> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
  const userProductDoc = await getDoc(doc(db, userProductPath, userProductId));

  if (userProductDoc.exists()) {
    return {
      id: userProductDoc.id,
      ...userProductDoc.data(),
    } as UserProduct & { id: string };
  }
  return undefined;
};

/**
 * Finds a user product by its library product ID (product_id field)
 * @param {string} userId - The ID of the user
 * @param {string} libraryProductId - The ID from the product library
 * @returns {Promise<UserProduct & { id: string } | undefined>}
 * @example
 * // Find user product using library product ID
 * const userProduct = await findUserProductByLibraryId("user123", "libraryProduct789");
 */
export const findUserProductByLibraryId = async (
  userId: string,
  libraryProductId: string
): Promise<(UserProduct & { id: string }) | undefined> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
  const existingProducts = await getDocs(
    query(
      collection(db, userProductPath),
      where("product_id", "==", libraryProductId)
    )
  );

  if (!existingProducts.empty) {
    const doc = existingProducts.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as UserProduct & { id: string };
  }
  return undefined;
};

/**
 * Updates the statistics of a user product based on measurement type
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product
 * @param {number} newPrice - The new price to include in statistics
 * @param {object} store - The store information
 * @param {MeasurementType} measurementType - The type of measurement (measurable or count)
 * @param {number} standardUnitPrice - The standard unit price for the measurement type
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateUserProductStats = async (
  userId: string,
  productId: string,
  newPrice: number,
  store: { id: string; name: string },
  measurementType: MeasurementType,
  standardUnitPrice: number
): Promise<boolean> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
  const userProductRef = doc(db, userProductPath, productId);
  const userProductDoc = await getDoc(userProductRef);

  if (userProductDoc.exists()) {
    const existingProduct = userProductDoc.data() as UserProduct;
    const currentStats = existingProduct.price_statistics[measurementType] || {
      total_price: 0,
      average_price: 0,
      lowest_price: 0,
      highest_price: 0,
      lowest_price_store: {
        store_id: "",
        store_name: "",
      },
      total_price_records: 0,
    };

    // Calculate new stats
    const newTotalPrice = (currentStats.total_price || 0) + standardUnitPrice;
    const newTotalRecords = (currentStats.total_price_records || 0) + 1;
    const newAveragePrice = newTotalPrice / newTotalRecords;

    const isLowestPrice =
      !currentStats.lowest_price ||
      standardUnitPrice < currentStats.lowest_price;
    const isHighestPrice =
      !currentStats.highest_price ||
      standardUnitPrice > currentStats.highest_price;

    // Update measurement types array if needed
    const measurementTypes = existingProduct.measurement_types || [];
    if (!measurementTypes.includes(measurementType)) {
      measurementTypes.push(measurementType);
    }

    // Prepare the new statistics
    const newStats: PriceStatistics = {
      total_price: newTotalPrice,
      average_price: newAveragePrice,
      lowest_price: isLowestPrice
        ? standardUnitPrice
        : currentStats.lowest_price,
      highest_price: isHighestPrice
        ? standardUnitPrice
        : currentStats.highest_price,
      lowest_price_store: isLowestPrice
        ? { store_id: store.id, store_name: store.name }
        : currentStats.lowest_price_store,
      total_price_records: newTotalRecords,
    };

    // Prepare the update data
    const updateData = {
      [`price_statistics.${measurementType}`]: newStats,
      measurement_types: measurementTypes,
      updated_at: new Date(),
    };

    await updateOneDocInDB(userProductPath, productId, updateData);
    return true;
  }
  return false;
};
