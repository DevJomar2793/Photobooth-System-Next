import { useEffect, useRef, useState } from "react";
import { Image, PixelRatio, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Asset, requestPermissionsAsync } from "expo-media-library";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Button, Text } from "react-native-paper";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { OfflineBanner } from "../components/OfflineBanner";
import { PhotoComposition } from "../components/PhotoComposition";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors } from "../constants/theme";
import { useBooth } from "../context/BoothContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { uploadImage } from "../services/api/images";
import { ApiError } from "../services/api/errors";
import type { BoothStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<BoothStackParamList, "Preview">;

export function PreviewScreen({ navigation }: Props) {
  const booth = useBooth();
  const { width: screenWidth } = useWindowDimensions();
  const compositionRef = useRef<View>(null);
  const [isComposing, setIsComposing] = useState(!booth.finalUri);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();
  const previewWidth = Math.min(screenWidth - 40, 370);

  useEffect(() => {
    if (!booth.template) {
      navigation.replace("Templates");
      return;
    }
    if (booth.finalUri || booth.shots.length === 0) return;

    const timer = setTimeout(() => {
      const pixelRatio = PixelRatio.get();
      void captureRef(compositionRef, {
        format: "jpg",
        quality: 0.96,
        result: "tmpfile",
        width: 1600 / pixelRatio,
        height: 2200 / pixelRatio,
      }).then((uri) => {
        booth.setFinalUri(uri);
        setIsComposing(false);
      }).catch(() => {
        setError("The final photo could not be generated. Please retake your photos.");
        setIsComposing(false);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [booth, navigation]);

  useEffect(() => {
    if (isOffline && booth.finalUri && !booth.hasDraft) {
      void booth.persistDraft();
    }
  }, [booth, isOffline]);

  const saveToLibrary = async () => {
    if (!booth.finalUri || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const permission = await requestPermissionsAsync(true, ["photo"]);
      if (!permission.granted) {
        setError("Photo library permission is required to save this image.");
        return;
      }
      await Asset.create(booth.finalUri);
    } catch {
      setError("The photo could not be saved to your library.");
    } finally {
      setIsSaving(false);
    }
  };

  const sharePhoto = async () => {
    if (!booth.finalUri) return;
    if (!(await Sharing.isAvailableAsync())) {
      setError("Sharing is not available on this device.");
      return;
    }
    await Sharing.shareAsync(booth.finalUri, { mimeType: "image/jpeg", dialogTitle: "Share your SnapCapture photo" });
  };

  const saveToGallery = async () => {
    if (!booth.finalUri || !booth.template || isUploading || isOffline) return;
    setIsUploading(true);
    setError(null);
    try {
      await uploadImage(booth.finalUri, booth.template.id);
      await booth.completeDraft();
      setUploadComplete(true);
    } catch (cause) {
      await booth.persistDraft();
      setError(cause instanceof ApiError ? cause.message : "Upload failed. Your photo was saved as a draft.");
    } finally {
      setIsUploading(false);
    }
  };

  const retake = () => {
    booth.setShots([]);
    navigation.replace("Camera");
  };

  const finish = async () => {
    await booth.discardDraft();
    booth.reset();
    navigation.popToTop();
  };

  if (!booth.template) return <LoadingState />;

  return (
    <Screen scroll contentStyle={styles.content}>
      <OfflineBanner />
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>FINAL STEP</Text>
        <Text variant="headlineMedium">Your photo booth strip</Text>
        <Text style={styles.muted}>Save it to your device, share it, or add it to the gallery.</Text>
      </View>

      <View style={styles.preview}>
        {booth.finalUri ? (
          <Image source={{ uri: booth.finalUri }} resizeMode="contain" style={{ width: previewWidth, height: previewWidth * 22 / 16 }} />
        ) : (
          <PhotoComposition ref={compositionRef} template={booth.template} shots={booth.shots} width={previewWidth} />
        )}
        {isComposing && <View style={[StyleSheet.absoluteFill, styles.processing]}><LoadingState label="Generating composition…" /></View>}
      </View>

      {error && <ErrorMessage message={error} />}
      {uploadComplete && <Text style={styles.success}>Saved to the gallery.</Text>}

      <View style={styles.actions}>
        {!uploadComplete ? (
          <PrimaryButton
            icon="cloud-upload-outline"
            loading={isUploading}
            disabled={!booth.finalUri || isComposing || isUploading || isOffline}
            onPress={() => void saveToGallery()}
          >
            {isUploading ? "Uploading…" : "Save to Gallery"}
          </PrimaryButton>
        ) : (
          <PrimaryButton onPress={() => void finish()}>Finish</PrimaryButton>
        )}
        <Button icon="download" loading={isSaving} disabled={!booth.finalUri || isSaving} onPress={() => void saveToLibrary()}>
          Save to Device
        </Button>
        <Button icon="share-variant" disabled={!booth.finalUri} onPress={() => void sharePhoto()}>Share</Button>
        {!uploadComplete && <Button icon="camera-retake" onPress={retake}>Retake All Photos</Button>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", paddingBottom: 36 },
  heading: { alignItems: "center", gap: 6 },
  eyebrow: { color: colors.accent, fontWeight: "800", letterSpacing: 1.5 },
  muted: { color: colors.muted, textAlign: "center" },
  preview: { borderRadius: 16, overflow: "hidden", position: "relative", backgroundColor: colors.surface },
  processing: { backgroundColor: "rgba(15,17,21,0.82)" },
  success: { color: colors.success, fontWeight: "700" },
  actions: { width: "100%", gap: 6 },
});
