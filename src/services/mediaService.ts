import { storage } from "./firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageType } from "../types";

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
      imageType === "preset"
        ? `product_image/${imageName}.png`
        : imageName;
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
