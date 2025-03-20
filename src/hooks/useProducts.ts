import { useState, useEffect } from "react";
import { Product } from "../types";
import { readAllDocs } from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsData = await readAllDocs<Product>(COLLECTIONS.PRODUCTS);
        setProducts(productsData);
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}
