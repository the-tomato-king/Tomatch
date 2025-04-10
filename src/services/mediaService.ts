import { storageHelper } from "./firebase/storageHelper";
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

export class MediaService {
  /**
   * Upload a product image to Firebase Storage
   */
  async uploadProductImage(
    userId: string,
    uri: string
  ): Promise<ImageUploadResult> {
    try {
      const timestamp = new Date().getTime();
      const imageName = `${timestamp}.jpg`;
      const imagePath = `product_image/${userId}/${imageName}`;

      // 转换图片
      const response = await fetch(uri);
      const blob = await response.blob();

      // 使用 helper 上传
      const url = await storageHelper.uploadBlob(imagePath, blob);

      return {
        url,
        path: imagePath,
      };
    } catch (error: any) {
      console.error("Error uploading product image:", error);
      throw new Error(`Failed to upload product image: ${error.message}`);
    }
  }

  /**
   * Get the URL of a product image
   */
  async getProductImage(
    imageName: string,
    imageType: ImageType,
    userId?: string
  ): Promise<string> {
    try {
      let imagePath;

      if (imageType === "preset_image") {
        imagePath = `product_image/${imageName}.png`;
      } else if (imageType === "user_image" && userId) {
        imagePath = `product_image/${userId}/${imageName}`;
      } else {
        throw new Error("Invalid image type or missing userId for user image");
      }

      return await storageHelper.getDownloadUrl(imagePath);
    } catch (error: any) {
      console.error("Error getting product image:", error);
      throw new Error(`Failed to get product image: ${error.message}`);
    }
  }

  /**
   * Get the URL of a store logo
   */
  async getStoreLogo(brand: string): Promise<string> {
    try {
      const logoPath = `store_logos/${brand}.png`;
      return await storageHelper.getDownloadUrl(logoPath);
    } catch (error: any) {
      console.error("Error getting store logo:", error);
      throw new Error(`Failed to get store logo: ${error.message}`);
    }
  }
}

// 导出单例
export const mediaService = new MediaService();
