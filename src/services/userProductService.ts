import { BaseUserProduct, UserProduct, PriceRecord, ImageType } from "../types";
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import {
  createDoc,
  updateOneDocInDB,
  deleteOneDocFromDB,
} from "./firebase/firebaseHelper";
import { uploadProductImage } from "./firebase/storageHelper";

interface ListenToUserProductResult {
  userProduct: UserProduct | null;
  productExists: boolean;
  error?: Error;
}

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

interface BasicProductData {
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

export const createUserProduct = async ({
  userId,
  productData,
  localImageUri,
}: CreateUserProductParams): Promise<string> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

  let finalImageSource = productData.image_source;
  if (localImageUri && productData.image_type === "user_image") {
    finalImageSource = await uploadProductImage(localImageUri, userId);
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

export const updateUserProduct = async ({
  userId,
  productId,
  productData,
  localImageUri,
}: UpdateUserProductParams): Promise<void> => {
  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

  let finalImageSource = productData.image_source;
  if (localImageUri && productData.image_type === "user_image") {
    finalImageSource = await uploadProductImage(localImageUri, userId);
  }

  const userProductToUpdate: Partial<BaseUserProduct> = {
    ...productData,
    image_source: finalImageSource,
    updated_at: new Date(),
  };

  await updateOneDocInDB(userProductPath, productId, userProductToUpdate);
};

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
