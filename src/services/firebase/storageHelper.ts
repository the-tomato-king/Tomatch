import { storage } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
import { ImageType } from "../../types/index";

// export const uploadImage = async (
//   uri: string,
//   path: string
// ): Promise<string> => {
//   try {
//     // convert uri to blob
//     const response = await fetch(uri);
//     const blob = await response.blob();

//     // create storage reference
//     const storageRef = ref(storage, path);

//     // upload file
//     await uploadBytes(storageRef, blob);

//     // get download URL
//     const downloadURL = await getDownloadURL(storageRef);
//     return downloadURL;
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     throw error;
//   }
// };

export const getStoreLogo = async (brand: string): Promise<string> => {
  const storage = getStorage();
  const logoRef = ref(storage, `store_logos/${brand}.png`);
  try {
    const url = await getDownloadURL(logoRef);
    return url;
  } catch (error) {
    console.error("Error getting store logo:", error);
    throw error;
  }
};

// export const getProductImage = async (
//   imageName: string,
//   imageType: ImageType,
//   userId?: string
// ): Promise<string> => {
//   const storage = getStorage();
//   let imagePath;

//   if (imageType === "preset_image") {
//     imagePath = `product_image/${imageName}.png`;
//   } else if (imageType === "user_image" && userId) {
//     imagePath = `product_image/${userId}/${imageName}`;
//   } else {
//     throw new Error("Invalid image type or missing userId for user image");
//   }

//   try {
//     const imageRef = ref(storage, imagePath);
//     const url = await getDownloadURL(imageRef);
//     return url;
//   } catch (error) {
//     console.error("Error getting product image:", error);
//     throw error;
//   }
// };

// export const uploadProductImage = async (
//   uri: string,
//   userId: string
// ): Promise<string> => {
//   try {
//     const timestamp = new Date().getTime();
//     const imageName = `${timestamp}.jpg`;
//     const imagePath = `product_image/${userId}/${imageName}`;

//     // convert uri to blob
//     const response = await fetch(uri);
//     const blob = await response.blob();

//     // create storage reference
//     const storage = getStorage();
//     const imageRef = ref(storage, imagePath);

//     // upload file
//     await uploadBytes(imageRef, blob);

//     // return the image name (not the full URL)
//     return imageName;
//   } catch (error) {
//     console.error("Error uploading product image:", error);
//     throw error;
//   }
// };

export class FirebaseStorageHelper {
  private storage = storage;

  async uploadBlob(path: string, blob: Blob): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  }

  async getDownloadUrl(path: string): Promise<string> {
    return await getDownloadURL(ref(this.storage, path));
  }
}

// 导出单例
export const storageHelper = new FirebaseStorageHelper();
