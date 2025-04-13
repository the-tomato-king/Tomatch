import { storage } from "./firebase/firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export interface ReceiptAnalysisResult {
  productName?: string;
  priceValue?: string;
  unitValue?: string;
  unitType?: string;
}

export interface ImageUploadResult {
  url: string;
  path: string;
}

/**
 * Uploads a product image to Firebase Storage
 * @param {string} userId - The ID of the user
 * @param {string} imageUri - The local URI of the image to upload
 * @returns {Promise<ImageUploadResult>} The upload result containing the URL
 * @throws {Error} When upload fails
 */
export const uploadProductImage = async (
  userId: string,
  imageUri: string
): Promise<ImageUploadResult> => {
  try {
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Generate unique image name using timestamp
    const timestamp = new Date().getTime();
    const imagePath = `products/${userId}/${timestamp}.jpg`;
    const imageRef = ref(storage, imagePath);

    // Upload blob
    await uploadBytes(imageRef, blob);
    const url = await getDownloadURL(imageRef);

    return { url, path: imagePath };
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

/**
 * Gets the URL of a product image
 * @param {string} imageName - The name of the image
 * @param {string} imageType - The type of image (preset or user)
 * @returns {Promise<string>} The download URL of the image
 */
export const getProductImage = async (
  imageName: string,
  imageType: "preset" | "user"
): Promise<string> => {
  try {
    const path =
      imageType === "preset" ? `product_image/${imageName}.png` : imageName;
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error getting product image:", error);
    throw error;
  }
};

/**
 * Gets the URL of a store logo
 * @param {string} brandName - The name of the brand
 * @returns {Promise<string>} The download URL of the logo
 */
export const getStoreLogo = async (brandName: string): Promise<string> => {
  try {
    const logoRef = ref(storage, `brands/${brandName}/logo.png`);
    return await getDownloadURL(logoRef);
  } catch (error) {
    console.error("Error getting store logo:", error);
    throw error;
  }
};

/**
 * Analyzes a receipt image using OpenAI
 * @param {string} imageBase64 - The base64 encoded image data
 * @returns {Promise<ReceiptAnalysisResult>} The analysis result
 * @throws {Error} When analysis fails or is not implemented
 */
export const analyzeReceiptImage = async (
  imageBase64: string
): Promise<ReceiptAnalysisResult> => {
  throw new Error("Receipt analysis not implemented yet");
};

/**
 * Deletes a product image from Firebase Storage
 * @param {string} imagePath - The path of the image in storage
 * @returns {Promise<boolean>} Whether the deletion was successful
 * @throws {Error} When deletion fails
 */
export const deleteProductImage = async (
  imagePath: string
): Promise<boolean> => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error("Error deleting product image:", error);
    // If the file doesn't exist, we consider it a successful deletion
    if ((error as any)?.code === "storage/object-not-found") {
      return true;
    }
    throw error;
  }
};

/**
 * Uploads a user avatar to Firebase Storage
 * @param {string} userId - The ID of the user
 * @param {string} imageUri - The local URI of the image to upload
 * @returns {Promise<ImageUploadResult>} The upload result containing the URL and path
 * @throws {Error} When upload fails
 */
export const uploadUserAvatar = async (
  userId: string,
  imageUri: string
): Promise<ImageUploadResult> => {
  try {
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Use a fixed name for the avatar to make it easier to manage
    const imagePath = `avatars/${userId}/avatar.jpg`;
    const imageRef = ref(storage, imagePath);

    // Upload blob
    await uploadBytes(imageRef, blob);
    const url = await getDownloadURL(imageRef);

    return { url, path: imagePath };
  } catch (error) {
    console.error("Error uploading user avatar:", error);
    throw error;
  }
};

/**
 * Deletes a user's avatar from Firebase Storage
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} Whether the deletion was successful
 * @throws {Error} When deletion fails
 */
export const deleteUserAvatar = async (userId: string): Promise<boolean> => {
  try {
    const imagePath = `avatars/${userId}/avatar.jpg`;
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error("Error deleting user avatar:", error);
    // If the file doesn't exist, we consider it a successful deletion
    if ((error as any)?.code === "storage/object-not-found") {
      return true;
    }
    throw error;
  }
};
