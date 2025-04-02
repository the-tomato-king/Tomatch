import { BaseStoreBrand } from "../types";

// Brand database version
export const BRAND_VERSION = {
  CURRENT: "0.1", // current version
  HISTORY: {
    V0_1: {
      version: "0.1",
      date: "2025-03-25",
      changes: "Initial brand database with common Canadian retail chains",
    },
  },
} as const;

// Store logo filenames in Firebase Storage
export const STORE_LOGOS = {
  SUPERSTORE: "superstore",
  WALMART: "",
  COSTCO: "",
  SAVE_ON_FOODS: "",
  T_AND_T: "",
  WHOLE_FOODS: "",
  NO_FRILLS: "",
  FRESHCO: "",
  SHOPPERS: "",
  LONDON_DRUGS: "",
} as const;

// Common Canadian retail brands data
export const BRANDS: Omit<BaseStoreBrand, "id">[] = [
  {
    name: "Canadian Superstore",
    logo: STORE_LOGOS.SUPERSTORE,
    updated_at: new Date(),
  },
  {
    name: "Walmart",
    logo: STORE_LOGOS.WALMART,
    updated_at: new Date(),
  },
  {
    name: "Costco",
    logo: STORE_LOGOS.COSTCO,
    updated_at: new Date(),
  },
  {
    name: "Save-On-Foods",
    logo: STORE_LOGOS.SAVE_ON_FOODS,
    updated_at: new Date(),
  },
  {
    name: "T&T Supermarket",
    logo: STORE_LOGOS.T_AND_T,
    updated_at: new Date(),
  },
  {
    name: "Whole Foods Market",
    logo: STORE_LOGOS.WHOLE_FOODS,
    updated_at: new Date(),
  },
  {
    name: "No Frills",
    logo: STORE_LOGOS.NO_FRILLS,
    updated_at: new Date(),
  },
  {
    name: "FreshCo",
    logo: STORE_LOGOS.FRESHCO,
    updated_at: new Date(),
  },
  {
    name: "Shoppers Drug Mart",
    logo: STORE_LOGOS.SHOPPERS,
    updated_at: new Date(),
  },
  {
    name: "London Drugs",
    logo: STORE_LOGOS.LONDON_DRUGS,
    updated_at: new Date(),
  },
];
