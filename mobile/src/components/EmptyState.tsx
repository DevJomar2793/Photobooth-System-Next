import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../constants/theme";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  message: { color: colors.muted, textAlign: "center" },
});
