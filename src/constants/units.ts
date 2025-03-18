export const UNITS = {
  WEIGHT: {
    G: "/g",
    HUNDRED_G: "/100g",
    KG: "/kg",
    MG: "/mg",
    LB: "/lb",
    OZ: "/oz",
  },
  VOLUME: {
    ML: "/ml",
    L: "/l",
    FL_OZ: "/fl oz",
    PT: "/pt",
    GAL: "/gal",
  },
  COUNT: {
    EACH: "/each",
    PACK: "/pack",
  },
} as const;

export const UNIT_CONVERSIONS = {
  WEIGHT: {
    G: 1,
    HUNDRED_G: 100,
    KG: 1000,
    MG: 0.001,
    LB: 453.6,
    OZ: 28.35,
  },
  VOLUME: {
    ML: 1,
    L: 1000,
    FL_OZ: 29.57,
    PT: 473,
    GAL: 3785,
  },
} as const;

// the flat array of all units for dropdown
export const ALL_UNITS = [
  // Weight Units
  UNITS.WEIGHT.G,
  UNITS.WEIGHT.HUNDRED_G,
  UNITS.WEIGHT.KG,
  UNITS.WEIGHT.MG,
  UNITS.WEIGHT.LB,
  UNITS.WEIGHT.OZ,
  // Volume Units
  UNITS.VOLUME.ML,
  UNITS.VOLUME.L,
  UNITS.VOLUME.FL_OZ,
  UNITS.VOLUME.PT,
  UNITS.VOLUME.GAL,
  UNITS.COUNT.EACH,
  UNITS.COUNT.PACK,
] as const;
