import { COLLECTIONS } from "../constants/firebase";
import { PRODUCTS } from "../data/Product";
import { batchCreateDocs } from "../services/firebase/firebaseHelper";

export async function importProductsToFirebase() {
  try {
    console.log("Starting to import products...");

    const result = await batchCreateDocs(COLLECTIONS.PRODUCTS, PRODUCTS);

    if (result) {
      console.log("Successfully imported all products");
      return true;
    } else {
      console.error("Failed to import products");
      return false;
    }
  } catch (error) {
    console.error("Error importing products:", error);
    return false;
  }
}
