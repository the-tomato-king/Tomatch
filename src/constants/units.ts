export const UNITS = {
  WEIGHT: {
    HG: "100g",
    KG: "kg",
    LB: "lb",
    OZ: "oz",
  },
  VOLUME: {
    L: "l",
  },
  COUNT: {
    EACH: "EA",
    PACK: "PK",
  },
} as const;

export const UNIT_CONVERSIONS = {
  WEIGHT: {
    HG: 1,
    KG: 0.1,
    LB: 2.20462,
    OZ: 35.274,
  },
  VOLUME: {
    L: 1,
  },
} as const;

// the flat array of all units for dropdown
export const ALL_UNITS = [
  // Weight Units
  UNITS.WEIGHT.HG,
  UNITS.WEIGHT.KG,
  UNITS.WEIGHT.LB,
  UNITS.WEIGHT.OZ,
  // Volume Units
  UNITS.VOLUME.L,
  UNITS.COUNT.EACH,
  UNITS.COUNT.PACK,
] as const;
