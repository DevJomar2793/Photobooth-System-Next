import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../constants/theme";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  if (!isOffline) return null;
  return <Text style={styles.banner}>You’re offline. Online actions are paused.</Text>;
}

const styles = StyleSheet.create({ banner: { backgroundColor: colors.accent, color: "#111827", padding: 10, textAlign: "center", fontWeight: "700" } });
