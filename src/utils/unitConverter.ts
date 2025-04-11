import { UNITS, STANDARD_WEIGHT_UNIT } from "../constants/units";

// conversion rate to standard unit (kg)
const WEIGHT_CONVERSION_RATES: Record<string, number> = {
  [UNITS.WEIGHT.G]: 0.001, // 1g = 0.001kg
  [UNITS.WEIGHT.HG]: 0.1, // 100g = 0.1kg
  [UNITS.WEIGHT.KG]: 1, // 1kg = 1kg
  [UNITS.WEIGHT.LB]: 0.45359, // 1lb = 0.45359kg
  [UNITS.WEIGHT.OZ]: 0.02835, // 1oz = 0.02835kg
};

// check if the unit is count unit (EA/PK)
export function isCountUnit(unit: string): boolean {
  return unit === UNITS.COUNT.EACH || unit === UNITS.COUNT.PACK;
}

// calculate the price per standard unit (kg)
export function calculateStandardPrice(
  price: number,
  quantity: number,
  unit: string
): number {
  // if the unit is count unit, return the price per unit (rounded to 2 decimals)
  if (isCountUnit(unit)) {
    return Number((price / quantity).toFixed(2));
  }

  // if the unit is weight unit, convert to price per kg
  const rate = WEIGHT_CONVERSION_RATES[unit];
  if (!rate) {
    throw new Error(`Unsupported unit: ${unit}`);
  }

  const weightInKg = quantity * rate;
  return Number((price / weightInKg).toFixed(2));
}

// convert from standard unit (kg) to target unit
export function convertFromStandard(
  standardValue: number,
  targetUnit: string
): number {
  // if the unit is count unit, return the standard value
  if (isCountUnit(targetUnit)) {
    return standardValue;
  }

  const rate = WEIGHT_CONVERSION_RATES[targetUnit];
  if (!rate) {
    throw new Error(`Unsupported unit: ${targetUnit}`);
  }
  return Number((standardValue * rate).toFixed(2));
}

// format price display
export function formatPriceWithUnit(price: number, unit: string): string {
  return `${price.toFixed(2)}/${unit}`;
}
