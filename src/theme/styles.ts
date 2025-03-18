import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  card: {
    backgroundColor: colors.white,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 5,
    padding: 15,
    marginBottom: 30,
  },
  // Button styles
  twoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
