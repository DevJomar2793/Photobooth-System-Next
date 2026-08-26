import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors } from "../constants/theme";

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && <Button onPress={onRetry}>Retry</Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.14)", gap: 6 },
  text: { color: colors.text },
});
