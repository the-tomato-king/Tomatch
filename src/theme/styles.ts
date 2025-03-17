import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    // backgroundColor: "pink",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  list: {

  },
  card: {
    backgroundColor: colors.white,
    padding: 10,
  
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    alignSelf: "center",
  },
});
