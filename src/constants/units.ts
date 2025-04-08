export const UNITS = {
  WEIGHT: {
    G: "g",
    HG: "100g",
    KG: "kg",
    LB: "lb",
    OZ: "oz",
  },
  VOLUME: {
    ML: "ml",
    L: "L",
  },
  COUNT: {
    EACH: "EA",
    PACK: "PK",
  },
} as const;

export const UNIT_CONVERSIONS = {
  WEIGHT: {
    G: 1,
    KG: 1000,
    LB: 453.6,
    OZ: 28.35,
  },
  VOLUME: {
    ML: 1,
    L: 1000,
  },
} as const;

// the flat array of all units for dropdown
export const ALL_UNITS = [
  // Weight Units
  UNITS.WEIGHT.G,
  UNITS.WEIGHT.KG,
  UNITS.WEIGHT.LB,
  UNITS.WEIGHT.OZ,
  // Volume Units
  UNITS.VOLUME.ML,
  UNITS.VOLUME.L,
  // Count Units
  UNITS.COUNT.EACH,
  UNITS.COUNT.PACK,
] as const;

// User selectable units for preferences
export const USER_SELECTABLE_UNITS = {
  WEIGHT: [
    { value: UNITS.WEIGHT.G, label: "/g" },
    { value: UNITS.WEIGHT.HG, label: "/100g" },
    { value: UNITS.WEIGHT.KG, label: "/kg" },
    { value: UNITS.WEIGHT.LB, label: "/lb" },
  ],
};
