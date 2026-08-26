import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" />
      <Text variant="bodyLarge">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 } });
