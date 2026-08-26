import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { Screen } from "../components/Screen";
import { TemplateCard } from "../components/TemplateCard";
import { LoadingState } from "../components/LoadingState";
import { PHOTO_TEMPLATES } from "../constants/templates";
import { colors } from "../constants/theme";
import { useBooth } from "../context/BoothContext";
import type { BoothStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<BoothStackParamList, "Templates">;

export function TemplateSelectionScreen({ navigation }: Props) {
  const booth = useBooth();
  if (booth.isHydrating) return <LoadingState label="Checking for an unfinished photo…" />;

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>STEP 1</Text>
        <Text variant="headlineLarge">Choose your layout</Text>
        <Text style={styles.intro}>Pick a design, then take four photos to create your booth strip.</Text>
      </View>

      {booth.hasDraft && booth.finalUri && booth.template && (
        <Card style={styles.draft}>
          <Card.Title title="Unfinished photo" subtitle="Your last composition is ready to upload." />
          <Card.Actions>
            <Button onPress={() => void booth.discardDraft()}>Discard</Button>
            <Button mode="contained" onPress={() => navigation.navigate("Preview")}>Resume</Button>
          </Card.Actions>
        </Card>
      )}

      {PHOTO_TEMPLATES.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPress={() => void (async () => {
            if (booth.hasDraft) await booth.discardDraft();
            booth.selectTemplate(template);
            navigation.navigate("Camera");
          })()}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  heading: { gap: 8, marginBottom: 4 },
  eyebrow: { color: colors.accent, fontWeight: "800", letterSpacing: 1.5 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  draft: { backgroundColor: colors.surfaceRaised },
});
