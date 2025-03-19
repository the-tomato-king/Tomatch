import { Product } from "../types";

// Product database version
export const PRODUCT_VERSION = {
  CURRENT: "0.1", // current version
  HISTORY: {
    // version history for tracking changes
    V0_1: {
      version: "0.1",
      date: "2025-03-19",
      changes: "Initial product database with 15 products for testing",
    },
    // Add new versions here when updating products
    // Example:
    // V1_1: {
    //   version: "1.1",
    //   date: "2024-03-21",
    //   changes: "Added new beverages"
    // }
  },
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = {
  FRUITS: "Fruits",
  VEGETABLES: "Vegetables",
  DAIRY: "Dairy",
  MEAT: "Meat",
  BAKERY: "Bakery",
  BEVERAGES: "Beverages",
  SNACKS: "Snacks",
  PANTRY: "Pantry",
  FROZEN: "Frozen",
  HOUSEHOLD: "Household",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

// mock data before implementing the api
export const PRODUCTS: Omit<Product, "product_id">[] = [
  // Fruits
  {
    name: "Banana",
    category: PRODUCT_CATEGORIES.FRUITS,
    imageType: "emoji",
    imageSource: "🍌",
    plu_code: "4011",
    barcode: "",
  },
  {
    name: "Fuji Apple",
    category: PRODUCT_CATEGORIES.FRUITS,
    imageType: "emoji",
    imageSource: "🍎",
    plu_code: "3613",
    barcode: "",
  },
  {
    name: "Orange",
    category: PRODUCT_CATEGORIES.FRUITS,
    imageType: "emoji",
    imageSource: "🍊",
    plu_code: "4012",
    barcode: "",
  },

  // Vegetables
  {
    name: "Spinach",
    category: PRODUCT_CATEGORIES.VEGETABLES,
    imageType: "emoji",
    imageSource: "🥬",
    plu_code: "4090",
    barcode: "",
  },
  {
    name: "Carrot",
    category: PRODUCT_CATEGORIES.VEGETABLES,
    imageType: "emoji",
    imageSource: "🥕",
    plu_code: "4562",
    barcode: "",
  },
  {
    name: "Tomato",
    category: PRODUCT_CATEGORIES.VEGETABLES,
    imageType: "emoji",
    imageSource: "🍅",
    plu_code: "4087",
    barcode: "",
  },

  // Dairy
  {
    name: "Whole Milk",
    category: PRODUCT_CATEGORIES.DAIRY,
    imageType: "emoji",
    imageSource: "🥛",
    plu_code: "",
    barcode: "",
  },
  {
    name: "Eggs",
    category: PRODUCT_CATEGORIES.DAIRY,
    imageType: "emoji",
    imageSource: "🥚",
    plu_code: "",
    barcode: "",
  },
  {
    name: "Cheddar Cheese",
    category: PRODUCT_CATEGORIES.DAIRY,
    imageType: "emoji",
    imageSource: "🧀",
    plu_code: "",
    barcode: "",
  },

  // Meat
  {
    name: "Chicken Breast",
    category: PRODUCT_CATEGORIES.MEAT,
    imageType: "emoji",
    imageSource: "🍗",
    plu_code: "",
    barcode: "",
  },
  {
    name: "Ground Beef",
    category: PRODUCT_CATEGORIES.MEAT,
    imageType: "emoji",
    imageSource: "🥩",
    plu_code: "",
    barcode: "",
  },

  // Bakery
  {
    name: "Wheat Bread",
    category: PRODUCT_CATEGORIES.BAKERY,
    imageType: "emoji",
    imageSource: "🍞",
    plu_code: "",
    barcode: "",
  },
  {
    name: "Croissant",
    category: PRODUCT_CATEGORIES.BAKERY,
    imageType: "emoji",
    imageSource: "🥐",
    plu_code: "",
    barcode: "",
  },

  // Beverages
  {
    name: "Bottled Water",
    category: PRODUCT_CATEGORIES.BEVERAGES,
    imageType: "emoji",
    imageSource: "💧",
    plu_code: "",
    barcode: "",
  },
  {
    name: "Coffee",
    category: PRODUCT_CATEGORIES.BEVERAGES,
    imageType: "emoji",
    imageSource: "☕",
    plu_code: "",
    barcode: "",
  },
];
