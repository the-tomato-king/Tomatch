import { COLLECTIONS } from "../../constants/firebase";
import { PRODUCTS, PRODUCT_VERSION } from "../../data/Product";
import { batchCreateDocs } from "./firebaseHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

const PRODUCT_VERSION_KEY = "PRODUCT_DB_VERSION";
const CURRENT_PRODUCT_VERSION = PRODUCT_VERSION.CURRENT;

export async function initializeAppData() {
  try {
    // check product database version
    const storedVersion = await AsyncStorage.getItem(PRODUCT_VERSION_KEY);
    console.log("storedVersion", storedVersion);

    if (storedVersion !== CURRENT_PRODUCT_VERSION) {
      console.log(
        `Updating products from version ${
          storedVersion || "none"
        } to ${CURRENT_PRODUCT_VERSION}`
      );

      // get existing products
      const existingProducts = new Set<string>();
      const productsSnapshot = await getDocs(
        collection(db, COLLECTIONS.PRODUCTS)
      );
      productsSnapshot.forEach((doc) => {
        existingProducts.add(doc.data().name);
      });

      // find new products to add
      const newProducts = PRODUCTS.filter(
        (product) => !existingProducts.has(product.name)
      );

      if (newProducts.length > 0) {
        console.log(`Found ${newProducts.length} new products to add`);
        await batchCreateDocs(COLLECTIONS.PRODUCTS, newProducts);
        console.log("New products added successfully");
      } else {
        console.log("No new products to add");
      }

      // update version number in local storage
      await AsyncStorage.setItem(PRODUCT_VERSION_KEY, CURRENT_PRODUCT_VERSION);
      console.log("Product database version updated");
    } else {
      console.log("Product database is already up to date");
    }
  } catch (error) {
    console.error("Error during product database update:", error);
  }
}
