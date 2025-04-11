import { useState, useEffect } from "react";
import { Product } from "../types";
import { searchProducts } from "../services/productLibraryService";

export const useProductSearch = () => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const results = searchProducts(searchTerm);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return {
    suggestions,
    searchTerm,
    setSearchTerm,
  };
};
