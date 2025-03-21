import { COLLECTIONS } from "../constants/firebase";
import { BRANDS } from "../data/Brand";
import { batchCreateDocs } from "../services/firebase/firebaseHelper";

async function main() {
  try {
    console.log("Starting to import brands...");

    const result = await batchCreateDocs(
      COLLECTIONS.STORE_BRANDS,
      BRANDS
    );

    if (result) {
      console.log("Successfully imported all brands");
      process.exit(0);
    } else {
      console.error("Failed to import brands");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error importing brands:", error);
    process.exit(1);
  }
}

main();
