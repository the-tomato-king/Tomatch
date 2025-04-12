import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { CURRENCIES } from "../constants/currencies";
import { User, UserLocation } from "../types";
import { updateOneDocInDB } from "../services/firebase/firebaseHelper";

interface UseUserPreferenceReturn {
  loading: boolean;
  error: string | null;
  preferences: {
    currency: string;
    location: UserLocation | null;
    unit: string;
  } | null;

  // format methods
  formatCurrency: (code: string) => string; // USD ($)
  formatLocation: (location: UserLocation) => string; // city, province

  // update methods
  updateCurrency: (currency: string) => Promise<void>;
  updateLocation: (location: UserLocation) => Promise<void>;
  updateWeightUnit: (unit: string) => Promise<void>;

  getCurrencySymbol: (code: string) => string;
}

export const useUserPreference = (userId: string): UseUserPreferenceReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<UseUserPreferenceReturn["preferences"]>(null);

  useEffect(() => {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as User;
          setPreferences({
            currency: userData.preferred_currency,
            location: userData.location,
            unit: userData.preferred_unit,
          });
          setError(null);
        } else {
          setError("User not found");
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const formatCurrency = (code: string) => {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency ? `${code} (${currency.symbol})` : code;
  };

  const formatLocation = (location: UserLocation) => {
    return `${location.city}, ${location.province}`;
  };

  const updatePreference = async (
    field: string,
    value: any,
    nestedField?: string
  ) => {
    try {
      const updateData = {
        updated_at: new Date(),
        [field]: nestedField ? { [nestedField]: value } : value,
      };
      await updateOneDocInDB(COLLECTIONS.USERS, userId, updateData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      throw error;
    }
  };

  const updateCurrency = (currency: string) =>
    updatePreference("preferred_currency", currency);

  const updateLocation = (location: UserLocation) =>
    updatePreference("location", location);

  const updateWeightUnit = (unit: string) =>
    updatePreference("preferred_unit", unit);

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol || "$";
  };

  return {
    loading,
    error,
    preferences,
    formatCurrency,
    formatLocation,
    updateCurrency,
    updateLocation,
    updateWeightUnit,
    getCurrencySymbol,
  };
};
