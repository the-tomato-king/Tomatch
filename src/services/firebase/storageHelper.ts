import { storage } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
export const uploadImage = async (
  uri: string,
  path: string
): Promise<string> => {
  try {
    // convert uri to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // create storage reference
    const storageRef = ref(storage, path);

    // upload file
    await uploadBytes(storageRef, blob);

    // get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

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