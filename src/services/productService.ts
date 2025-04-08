import { Product } from "../types";
import { PRODUCTS, PRODUCT_VERSION } from "../data/Product";

/**
 * Get all local products
 * @returns Array of all products
 */
export const getAllProducts = (): Product[] => {
  return PRODUCTS;
};

/**
 * Get product by ID
 * @param id Product ID
 * @returns Found product or undefined
 */
export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === id);
};

/**
 * Search products
 * @param query Search keyword
 * @returns Array of matched products
 */
export const searchProducts = (query: string): Product[] => {
  if (!query || query.trim() === "") {
    return PRODUCTS;
  }

  const normalizedQuery = query.toLowerCase().trim();
  return PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Filter products by category
 * @param category Product category
 * @returns Array of matched products
 */
export const filterProductsByCategory = (category: string): Product[] => {
  if (category === "all") {
    return PRODUCTS;
  }

  return PRODUCTS.filter((product) => product.category === category);
};

/**
 * Get product version
 * @returns Current product library version
 */
export const getProductVersion = () => {
  return PRODUCT_VERSION.CURRENT;
};
