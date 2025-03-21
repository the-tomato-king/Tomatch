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

// Common Canadian retail brands data
export const BRANDS: Omit<BaseStoreBrand, "id">[] = [
  {
    name: "Canadian Superstore",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "Walmart",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "Costco",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "Save-On-Foods",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "T&T Supermarket",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "Whole Foods Market",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "No Frills",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "FreshCo",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "Shoppers Drug Mart",
    logo_url: "",
    updated_at: new Date(),
  },
  {
    name: "London Drugs",
    logo_url: "",
    updated_at: new Date(),
  },
];
