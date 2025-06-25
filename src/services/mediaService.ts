import { storage } from "./firebase/firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * Interface for receipt analysis results
 * @interface
 */
export interface ReceiptAnalysisResult {
  productName?: string;
  priceValue?: string;
  unitValue?: string;
  unitType?: string;
}

/**
 * Interface for image upload results
 * @interface
 */
export interface ImageUploadResult {
  url: string;
  path: string;
}

/**
 * Uploads a product image to Firebase Storage
 * @param {string} userId - The ID of the user who owns the product
 * @param {string} imageUri - The local URI or path of the image to upload
 * @returns {Promise<ImageUploadResult>} Object containing the download URL and storage path
 * @throws {Error} When the upload fails or the image format is invalid
 * @example
 * try {
 *   const result = await uploadProductImage("user123", "file:///path/to/image.jpg");
 *   console.log("Image URL:", result.url);
 * } catch (error) {
 *   console.error("Upload failed:", error);
 * }
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
 * Retrieves the download URL of a product image
 * @param {string} imageName - The name or identifier of the image
 * @param {"preset" | "user"} imageType - Whether the image is a preset or user-uploaded image
 * @returns {Promise<string>} The download URL of the image
 * @throws {Error} When the image doesn't exist or cannot be accessed
 * @example
 * const imageUrl = await getProductImage("apple", "preset");
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
 * Retrieves the download URL of a store's logo
 * @param {string} brandName - The name of the brand/store
 * @returns {Promise<string>} The download URL of the logo
 * @throws {Error} When the logo doesn't exist or cannot be accessed
 * @example
 * const logoUrl = await getStoreLogo("walmart");
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
 * Analyzes a receipt image to extract product information
 * @param {string} imageBase64 - The base64 encoded image data of the receipt
 * @returns {Promise<ReceiptAnalysisResult>} Extracted information from the receipt
 * @throws {Error} When analysis fails or the feature is not implemented
 * @example
 * try {
 *   const result = await analyzeReceiptImage(base64Data);
 *   console.log("Product name:", result.productName);
 * } catch (error) {
 *   console.error("Analysis failed:", error);
 * }
 */
export const analyzeReceiptImage = async (
  imageBase64: string
): Promise<ReceiptAnalysisResult> => {
  throw new Error("Receipt analysis not implemented yet");
};

/**
 * Deletes a product image from Firebase Storage
 * @param {string} imagePath - The storage path of the image to delete
 * @returns {Promise<boolean>} True if deletion was successful or file didn't exist
 * @throws {Error} When deletion fails for reasons other than file not found
 * @example
 * const success = await deleteProductImage("products/user123/image.jpg");
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
 * Uploads or updates a user's avatar image
 * @param {string} userId - The ID of the user
 * @param {string} imageUri - The local URI or path of the avatar image
 * @returns {Promise<ImageUploadResult>} Object containing the download URL and storage path
 * @throws {Error} When the upload fails or the image format is invalid
 * @example
 * try {
 *   const result = await uploadUserAvatar("user123", "file:///path/to/avatar.jpg");
 *   console.log("Avatar URL:", result.url);
 * } catch (error) {
 *   console.error("Upload failed:", error);
 * }
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
 * @param {string} userId - The ID of the user whose avatar should be deleted
 * @returns {Promise<boolean>} True if deletion was successful or file didn't exist
 * @throws {Error} When deletion fails for reasons other than file not found
 * @example
 * try {
 *   const success = await deleteUserAvatar("user123");
 *   if (success) {
 *     console.log("Avatar deleted successfully");
 *   }
 * } catch (error) {
 *   console.error("Deletion failed:", error);
 * }
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
