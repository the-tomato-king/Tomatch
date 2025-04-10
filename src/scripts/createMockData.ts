// scripts/createMockData.ts
import { db } from "../services/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { COLLECTIONS } from "../constants/firebase";
import { BaseUserProduct, BasePriceRecord } from "../types";

const createMockData = async () => {
  const userId = "HgoXPKP6slgDZMJRunKH4Fj97GA2"; // 替换成你的用户ID
  const storeId = "RG24QX677a1ZsYRufCbE";

  try {
    // 1. 创建 user product
    const userProductRef = doc(collection(db, `users/${userId}/user_products`));
    const userProductData: BaseUserProduct = {
      product_id: "",
      name: "Test Apple",
      category: "Fruits",
      image_type: "emoji",
      image_source: "🍎",
      plu_code: "",
      barcode: "",

      measurement_types: ["measurable", "count"],

      price_statistics: {
        measurable: {
          total_price: 5.99,
          average_price: 6.6,
          lowest_price: 6.6,
          highest_price: 6.6,
          lowest_price_store: {
            store_id: storeId,
            store_name: "Walmart Supercentre",
          },
          total_price_records: 1,
        },
        count: {
          total_price: 3.99,
          average_price: 0.99,
          lowest_price: 0.99,
          highest_price: 0.99,
          lowest_price_store: {
            store_id: storeId,
            store_name: "Walmart Supercentre",
          },
          total_price_records: 1,
        },
      },

      created_at: new Date(),
      updated_at: new Date(),
    };

    await setDoc(userProductRef, userProductData);
    console.log("Created user product with ID:", userProductRef.id);

    // 2. 创建按重量计价的记录
    const weightRecordRef = doc(
      collection(db, `users/${userId}/price_records`)
    );
    const weightRecordData: BasePriceRecord = {
      user_product_id: userProductRef.id,
      store_id: storeId,

      original_price: "5.99",
      original_quantity: "2",
      original_unit: "lb",
      standard_unit_price: "6.60",

      currency: "$",
      photo_url: "",
      recorded_at: new Date(),
    };

    await setDoc(weightRecordRef, weightRecordData);
    console.log("Created weight price record with ID:", weightRecordRef.id);

    // 3. 创建按个数计价的记录
    const countRecordRef = doc(collection(db, `users/${userId}/price_records`));
    const countRecordData: BasePriceRecord = {
      user_product_id: userProductRef.id,
      store_id: storeId,

      original_price: "3.99",
      original_quantity: "4",
      original_unit: "EA",
      standard_unit_price: "0.99",

      currency: "$",
      photo_url: "",
      recorded_at: new Date(),
    };

    await setDoc(countRecordRef, countRecordData);
    console.log("Created count price record with ID:", countRecordRef.id);
  } catch (error) {
    console.error("Error creating mock data:", error);
    throw error;
  }
};

// 运行脚本
createMockData()
  .then(() => {
    console.log("Mock data creation completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
