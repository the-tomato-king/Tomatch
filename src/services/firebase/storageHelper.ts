import { storage } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
