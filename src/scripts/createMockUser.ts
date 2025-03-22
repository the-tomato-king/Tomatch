import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { COLLECTIONS } from "../constants/firebase";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createMockUser() {
  try {
    const userId = "user123";

    const userData = {
      id: userId,
      name: "User123",
      email: "user123@gmail.com",
      phone_number: "123-456-7890",
      location: {
        country: "Canada",
        province: "Ontario",
        city: "Toronto",
        street_address: "123 Maple Street",
        postcode: "M5V 2T6",
        coordinates: {
          latitude: 43.6532,
          longitude: -79.3832,
        },
      },
      preferred_unit: {
        weight: "lb",
        volume: "oz",
      },
      preferred_currency: "CAD",
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 将用户数据写入Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, userId), userData);

    console.log(`Mock user created with ID: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error creating mock user:", error);
    return false;
  }
}

createMockUser()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
