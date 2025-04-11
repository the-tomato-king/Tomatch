import { useUserPreference } from "./useUserPreference";
import {
  convertFromStandard,
  formatPriceWithUnit,
} from "../utils/unitConverter";
import { useAuth } from "../contexts/AuthContext";

export function useUnitDisplay() {
  const { userId } = useAuth();
  const { preferences } = useUserPreference(userId as string);

  const convertToPreferredUnit = (standardPrice: number) => {
    if (!preferences?.unit) {
      return standardPrice; // if there is no preferred unit, return the standard price
    }
    return convertFromStandard(standardPrice, preferences.unit);
  };

  const formatPrice = (standardPrice: number) => {
    const convertedPrice = convertToPreferredUnit(standardPrice);
    return formatPriceWithUnit(convertedPrice, preferences?.unit || "kg");
  };

  return {
    convertToPreferredUnit,
    formatPrice,
    preferredUnit: preferences?.unit,
  };
}
