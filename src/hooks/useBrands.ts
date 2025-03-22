import { useState, useEffect } from "react";
import { StoreBrand } from "../types";
import { readAllDocs } from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";

export function useBrands() {
  const [brands, setBrands] = useState<StoreBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const brandsData = await readAllDocs<StoreBrand>(
          COLLECTIONS.STORE_BRANDS
        );
        setBrands(brandsData);
      } catch (err) {
        setError("Failed to fetch brands");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBrands();
  }, []);

  return { brands, loading, error };
}
