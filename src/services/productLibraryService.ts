import { Product } from "../types";
import { PRODUCTS, PRODUCT_VERSION } from "../data/Product";

/**
 * Gets all products from the local product library
 * @returns {Product[]} Array of all available products
 * @example
 * const allProducts = getAllProducts();
 */
export const getAllProducts = (): Product[] => {
  return PRODUCTS;
};

/**
 * Gets a product by its unique identifier
 * @param {string} id - The unique identifier of the product
 * @returns {Product | undefined} The found product or undefined if not found
 * @example
 * const product = getProductById("product123");
 * if (product) {
 *   console.log(product.name);
 * }
 */
export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === id);
};

/**
 * Searches products by name using a case-insensitive partial match
 * @param {string} query - The search query string
 * @returns {Product[]} Array of products matching the search query
 * @example
 * const results = searchProducts("apple");
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
 * Filters products by their category
 * @param {string} category - The category to filter by, use "all" for all categories
 * @returns {Product[]} Array of products in the specified category
 * @example
 * const fruits = filterProductsByCategory("fruits");
 * const allProducts = filterProductsByCategory("all");
 */
export const filterProductsByCategory = (category: string): Product[] => {
  if (category === "all") {
    return PRODUCTS;
  }

  return PRODUCTS.filter((product) => product.category === category);
};

/**
 * Gets the current version of the product library
 * @returns {string} The current version string of the product library
 * @example
 * const version = getProductVersion();
 * console.log(`Product library version: ${version}`);
 */
export const getProductVersion = (): string => {
  return PRODUCT_VERSION.CURRENT;
};
