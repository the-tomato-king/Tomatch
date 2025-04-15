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
  // Navigation styles
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 17,
    color: colors.primary,
  },
  // Input styles
  inputsContainer: {
    borderRadius: 8,
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: colors.lightGray2,
    borderRadius: 8,
    height: 48,
    alignItems: "center",
  },
  labelContainer: {
    width: 40,
    paddingLeft: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.darkText,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  // Button styles
  buttonsContainer: {
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
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
