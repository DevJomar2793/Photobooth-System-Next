import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BoothProvider } from "./src/context/BoothContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { appTheme } from "./src/constants/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <BoothProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </BoothProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
