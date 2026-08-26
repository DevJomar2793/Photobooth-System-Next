import { useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Asset, requestPermissionsAsync } from "expo-media-library";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Button, Text } from "react-native-paper";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { OfflineBanner } from "../components/OfflineBanner";
import { Screen } from "../components/Screen";
import { colors } from "../constants/theme";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { downloadUrl, getImage, imageUrl } from "../services/api/images";
import { ApiError } from "../services/api/errors";
import type { GalleryImage } from "../types/api";
import type { GalleryStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<GalleryStackParamList, "PhotoDetail">;

export function PhotoDetailScreen({ route }: Props) {
  const [image, setImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();

  const load = useCallback(async () => {
    if (isOffline) {
      setError("Connect to the internet to view this photo.");
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      setImage(await getImage(route.params.imageId));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The photo could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, route.params.imageId]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const download = async () => {
    const destination = new File(Paths.cache, `snapcapture-${route.params.imageId}.jpg`);
    return File.downloadFileAsync(downloadUrl(route.params.imageId), destination, { idempotent: true });
  };

  const save = async () => {
    if (isOffline || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const permission = await requestPermissionsAsync(true, ["photo"]);
      if (!permission.granted) {
        setError("Photo library permission is required to save this image.");
        return;
      }
      const file = await download();
      await Asset.create(file.uri);
    } catch {
      setError("The photo could not be downloaded.");
    } finally {
      setIsSaving(false);
    }
  };

  const share = async () => {
    if (isOffline) return;
    try {
      const file = await download();
      await Sharing.shareAsync(file.uri, { mimeType: "image/jpeg", dialogTitle: "Share SnapCapture photo" });
    } catch {
      setError("The photo could not be shared.");
    }
  };

  if (isLoading) return <LoadingState label="Loading photo…" />;

  return (
    <Screen scroll contentStyle={styles.content}>
      <OfflineBanner />
      {error && <ErrorMessage message={error} onRetry={() => void load()} />}
      {image && (
        <>
          <Image source={{ uri: imageUrl(image.filename) }} style={styles.image} resizeMode="contain" />
          <Text variant="titleLarge">{image.original_name || "Untitled"}</Text>
          <Text style={styles.muted}>{image.user || "Anonymous"}{image.captured_at ? ` · ${new Date(image.captured_at).toLocaleString()}` : ""}</Text>
          <View style={styles.actions}>
            <Button mode="contained" icon="download" loading={isSaving} disabled={isOffline || isSaving} onPress={() => void save()}>Save to Device</Button>
            <Button mode="outlined" icon="share-variant" disabled={isOffline} onPress={() => void share()}>Share</Button>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  image: { width: "100%", aspectRatio: 16 / 22, backgroundColor: "#000000", borderRadius: 16 },
  muted: { color: colors.muted, textAlign: "center" },
  actions: { width: "100%", gap: 8 },
});
