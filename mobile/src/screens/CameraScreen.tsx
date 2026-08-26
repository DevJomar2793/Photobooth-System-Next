import { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, IconButton, SegmentedButtons, Text } from "react-native-paper";
import { ErrorMessage } from "../components/ErrorMessage";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { CAPTURE_COUNT, TIMER_OPTIONS } from "../constants/config";
import { colors } from "../constants/theme";
import { useBooth } from "../context/BoothContext";
import type { CapturedShot } from "../types/booth";
import type { BoothStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<BoothStackParamList, "Camera">;

export function CameraScreen({ navigation }: Props) {
  const booth = useBooth();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [shots, setLocalShots] = useState<CapturedShot[]>([]);
  const [facing, setFacing] = useState<CameraType>("front");
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useFocusEffect(useCallback(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(null);
  }, []));

  useEffect(() => {
    if (!booth.template) navigation.replace("Templates");
  }, [booth.template, navigation]);

  const capture = useCallback(async () => {
    if (!cameraRef.current || !isReady || isCapturing || shots.length >= CAPTURE_COUNT) return;
    setIsCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92, skipProcessing: false });
      const next = [...shots, { id: `${Date.now()}`, uri: photo.uri }];
      setLocalShots(next);
      if (next.length === CAPTURE_COUNT) {
        booth.setShots(next);
        navigation.replace("Preview");
      }
    } catch {
      setError("The photo could not be captured. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [booth, isCapturing, isReady, navigation, shots]);

  const startCapture = useCallback(() => {
    if (countdown !== null || isCapturing) return;
    if (timerSeconds === 0) {
      void capture();
      return;
    }
    let remaining = timerSeconds;
    setCountdown(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);
        void capture();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [capture, countdown, isCapturing, timerSeconds]);

  if (!permission) return <View style={styles.permissionPage} />;
  if (!permission.granted) {
    return (
      <Screen contentStyle={styles.permissionPage}>
        <Text variant="headlineSmall">Camera access is required</Text>
        <Text style={styles.muted}>Allow camera access to take your four booth photos.</Text>
        <PrimaryButton onPress={() => void requestPermission()}>Allow Camera</PrimaryButton>
        {!permission.canAskAgain && <Text style={styles.muted}>Enable camera access in your device settings.</Text>}
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.statusRow}>
        <View>
          <Text variant="titleLarge">Capture {Math.min(shots.length + 1, CAPTURE_COUNT)} of {CAPTURE_COUNT}</Text>
          <Text style={styles.muted}>{booth.template?.name}</Text>
        </View>
        <Button onPress={() => navigation.replace("Templates")}>Cancel</Button>
      </View>

      <View style={styles.cameraShell}>
        {isFocused && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mirror={facing === "front"}
            onCameraReady={() => setIsReady(true)}
            onMountError={() => setError("The camera is unavailable on this device.")}
          />
        )}
        {countdown !== null && <View style={[StyleSheet.absoluteFill, styles.countdown]}><Text style={styles.countdownText}>{countdown}</Text></View>}
      </View>

      {error && <ErrorMessage message={error} />}

      <View style={styles.controls}>
        <SegmentedButtons
          value={`${timerSeconds}`}
          onValueChange={(value) => setTimerSeconds(Number(value))}
          buttons={TIMER_OPTIONS.map((seconds) => ({ value: `${seconds}`, label: `${seconds}s` }))}
        />
        <View style={styles.captureRow}>
          <IconButton icon="camera-flip-outline" size={28} onPress={() => setFacing((value) => value === "front" ? "back" : "front")} />
          <IconButton
            icon="camera"
            mode="contained"
            containerColor="#FFFFFF"
            iconColor="#111827"
            size={38}
            disabled={!isReady || isCapturing || countdown !== null}
            onPress={startCapture}
            accessibilityLabel="Take photo"
          />
          <View style={{ width: 52 }} />
        </View>
        <View style={styles.shots}>
          {Array.from({ length: CAPTURE_COUNT }, (_, index) => {
            const shot = shots[index];
            return shot
              ? <Image key={shot.id} source={{ uri: shot.uri }} style={styles.thumbnail} />
              : <View key={index} style={styles.placeholder}><Text>{index + 1}</Text></View>;
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0, gap: 0 },
  permissionPage: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28, gap: 16, backgroundColor: colors.background },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  muted: { color: colors.muted, textAlign: "center" },
  cameraShell: { flex: 1, backgroundColor: "#000000", overflow: "hidden" },
  countdown: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  countdownText: { fontSize: 96, fontWeight: "900", color: "#FFFFFF" },
  controls: { padding: 14, gap: 12, backgroundColor: colors.surface },
  captureRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  thumbnail: { width: 42, height: 54, borderRadius: 6, borderWidth: 2, borderColor: colors.accent },
  placeholder: { width: 42, height: 54, borderRadius: 6, borderWidth: 1, borderColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" },
});
