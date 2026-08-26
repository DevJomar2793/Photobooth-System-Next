import { Image, Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import type { GalleryImage } from "../types/api";
import { colors } from "../constants/theme";
import { imageUrl } from "../services/api/images";

interface PhotoCardProps {
  image: GalleryImage;
  onOpen: () => void;
  onDelete: () => void;
}

export function PhotoCard({ image, onOpen, onDelete }: PhotoCardProps) {
  const date = image.captured_at
    ? new Date(image.captured_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Unknown date";
  return (
    <Pressable onPress={onOpen} style={styles.card} accessibilityRole="button">
      <Image source={{ uri: imageUrl(image.filename) }} style={styles.image} resizeMode="cover" />
      <View style={styles.footer}>
        <View style={styles.copy}>
          <Text numberOfLines={1} variant="titleSmall">{image.original_name || "Untitled"}</Text>
          <Text numberOfLines={1} style={styles.meta}>{image.user || "Anonymous"} · {date}</Text>
        </View>
        <IconButton
          icon="delete-outline"
          iconColor={colors.danger}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          accessibilityLabel="Delete photo"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", minWidth: 150 },
  image: { width: "100%", aspectRatio: 3 / 4, backgroundColor: colors.surfaceRaised },
  footer: { flexDirection: "row", alignItems: "center", paddingLeft: 12 },
  copy: { flex: 1, gap: 2 },
  meta: { color: colors.muted, fontSize: 11 },
});
