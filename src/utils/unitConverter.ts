import { UNITS, STANDARD_WEIGHT_UNIT } from "../constants/units";

// conversion rate to standard unit (g)
const WEIGHT_CONVERSION_RATES: Record<string, number> = {
  [UNITS.WEIGHT.G]: 1,
  [UNITS.WEIGHT.KG]: 1000,
  [UNITS.WEIGHT.LB]: 453.59237,
  [UNITS.WEIGHT.OZ]: 28.3495,
};

export class UnitConverter {
  // check if the unit is count unit (EA/PK)
  // return true if the unit is count unit
  static isCountUnit(unit: string): boolean {
    return unit === UNITS.COUNT.EACH || unit === UNITS.COUNT.PACK;
  }

  // calculate the price per standard unit (g)
  static calculateStandardPrice(
    price: number,
    quantity: number,
    unit: string
  ): number {
    // if the unit is count unit, return the price per unit
    if (this.isCountUnit(unit)) {
      return price / quantity;
    }

    // if the unit is weight unit, convert to price per gram
    const rate = WEIGHT_CONVERSION_RATES[unit];
    if (!rate) {
      throw new Error(`Unsupported unit: ${unit}`);
    }

    const weightInGrams = quantity * rate;
    return price / weightInGrams;
  }
}
