import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useUnitDisplay } from "../hooks/useUnitDisplay";
import { useUserPreference } from "../hooks/useUserPreference";
import { useAuth } from "../contexts/AuthContext";

interface PriceDisplayProps {
  standardPrice: number | undefined;
  style?: StyleProp<TextStyle>;
  measurementType?: "measurable" | "count";
}

export function PriceDisplay({
  standardPrice,
  style,
  measurementType = "measurable",
}: PriceDisplayProps) {
  const { userId } = useAuth();
  const { convertToPreferredUnit } = useUnitDisplay();
  const { preferences, getCurrencySymbol } = useUserPreference(userId!);

  if (standardPrice === undefined || !preferences) return null;

  // only convert to preferred unit on measurable type
  const displayPrice =
    measurementType === "measurable"
      ? convertToPreferredUnit(standardPrice)
      : standardPrice;

  return (
    <Text style={style}>
      {getCurrencySymbol(preferences.currency)}
      {displayPrice.toFixed(2)}
    </Text>
  );
}
