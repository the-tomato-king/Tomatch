import { StoreBrand } from "../types";
import { BRANDS } from "../data/Brand";

export function useBrands() {
  // Since we're using local data, we can directly return the BRANDS
  // No need for loading or error states
  return {
    brands: BRANDS,
    loading: false,
    error: null,
  };
}
