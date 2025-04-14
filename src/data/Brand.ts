import { StoreBrand } from "../types";

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
  WALMART: "Walmart",
  COSTCO: "Costco",
  SAVE_ON_FOODS: "SaveOnFoods",
  T_AND_T: "T&T",
  WHOLE_FOODS: "WholeFoodsMarket",
  NO_FRILLS: "NoFills",
  FRESHCO: "FreshCo",
  SHOPPERS: "ShoppersDrugMart",
  LONDON_DRUGS: "LondonDrugs",
} as const;

// Common Canadian retail brands data
export const BRANDS: StoreBrand[] = [
  {
    id: "superstore",
    name: "Canadian Superstore",
    logo: STORE_LOGOS.SUPERSTORE,
  },
  {
    id: "walmart",
    name: "Walmart",
    logo: STORE_LOGOS.WALMART,
  },
  {
    id: "costco",
    name: "Costco",
    logo: STORE_LOGOS.COSTCO,
  },
  {
    id: "save-on-foods",
    name: "Save-On-Foods",
    logo: STORE_LOGOS.SAVE_ON_FOODS,
  },
  {
    id: "t-and-t",
    name: "T&T Supermarket",
    logo: STORE_LOGOS.T_AND_T,
  },
  {
    id: "whole-foods",
    name: "Whole Foods Market",
    logo: STORE_LOGOS.WHOLE_FOODS,
  },
  {
    id: "no-frills",
    name: "No Frills",
    logo: STORE_LOGOS.NO_FRILLS,
  },
  {
    id: "freshco",
    name: "FreshCo",
    logo: STORE_LOGOS.FRESHCO,
  },
  {
    id: "shoppers",
    name: "Shoppers Drug Mart",
    logo: STORE_LOGOS.SHOPPERS,
  },
  {
    id: "london-drugs",
    name: "London Drugs",
    logo: STORE_LOGOS.LONDON_DRUGS,
  },
];
