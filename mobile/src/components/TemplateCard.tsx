import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { PhotoComposition } from "./PhotoComposition";
import type { PhotoTemplate } from "../types/booth";
import { colors } from "../constants/theme";

export function TemplateCard({ template, onPress }: { template: PhotoTemplate; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose ${template.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.preview}><PhotoComposition template={template} shots={[]} width={112} /></View>
      <View style={styles.copy}>
        <Text variant="titleMedium">{template.name}</Text>
        <Text style={styles.description}>{template.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: colors.surface, padding: 16, borderRadius: 18, gap: 18, alignItems: "center" },
  preview: { borderRadius: 10, overflow: "hidden" },
  copy: { flex: 1, gap: 6 },
  description: { color: colors.muted, lineHeight: 20 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
