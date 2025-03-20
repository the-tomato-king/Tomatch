import { COLLECTIONS } from "../constants/firebase";
import { PRODUCTS } from "../data/Product";
import { batchCreateDocs } from "../services/firebase/firebaseHelper";

async function main() {
  try {
    console.log("Starting to import products...");

    const result = await batchCreateDocs(COLLECTIONS.PRODUCTS, PRODUCTS);

    if (result) {
      console.log("Successfully imported all products");
      process.exit(0);
    } else {
      console.error("Failed to import products");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error importing products:", error);
    process.exit(1);
  }
}

main();
