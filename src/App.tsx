import { StatusBar } from "expo-status-bar";
import Navigation from "./navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocationProvider } from "./contexts/LocationContext";

export default function App() {
  return (
    <LocationProvider>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </LocationProvider>
  );
}
