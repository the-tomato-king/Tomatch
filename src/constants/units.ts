export const STANDARD_WEIGHT_UNIT = "g";

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
  },
} as const;

// export unit types
export type WeightUnit = (typeof UNITS.WEIGHT)[keyof typeof UNITS.WEIGHT];
export type VolumeUnit = (typeof UNITS.VOLUME)[keyof typeof UNITS.VOLUME];
export type CountUnit = (typeof UNITS.COUNT)[keyof typeof UNITS.COUNT];

// measurable unit includes weight and volume
export type MeasurableUnit = WeightUnit | VolumeUnit;
export type Unit = MeasurableUnit | CountUnit;

// helper functions for type checking
export const isWeightUnit = (unit: Unit): unit is WeightUnit => {
  return Object.values(UNITS.WEIGHT).includes(unit as WeightUnit);
};

export const isVolumeUnit = (unit: Unit): unit is VolumeUnit => {
  return Object.values(UNITS.VOLUME).includes(unit as VolumeUnit);
};

export const isCountUnit = (unit: Unit): unit is CountUnit => {
  return Object.values(UNITS.COUNT).includes(unit as CountUnit);
};

export const isMeasurableUnit = (unit: Unit): unit is MeasurableUnit => {
  return isWeightUnit(unit) || isVolumeUnit(unit);
};

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
