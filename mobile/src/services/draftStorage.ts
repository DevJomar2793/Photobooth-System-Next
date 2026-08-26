import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import type { BoothDraft } from "../types/booth";

const DRAFT_KEY = "snapcapture.latestDraft";
const DRAFT_FILENAME = "snapcapture-draft.jpg";

export async function saveDraft(templateId: string, sourceUri: string) {
  const source = new File(sourceUri);
  const destination = new File(Paths.document, DRAFT_FILENAME);
  if (destination.exists) destination.delete();
  await source.copy(destination);

  const draft: BoothDraft = {
    templateId,
    finalUri: destination.uri,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export async function loadDraft(): Promise<BoothDraft | null> {
  const stored = await AsyncStorage.getItem(DRAFT_KEY);
  if (!stored) return null;

  try {
    const draft = JSON.parse(stored) as BoothDraft;
    if (!new File(draft.finalUri).exists) {
      await AsyncStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    await AsyncStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

export async function clearDraft() {
  const destination = new File(Paths.document, DRAFT_FILENAME);
  if (destination.exists) destination.delete();
  await AsyncStorage.removeItem(DRAFT_KEY);
}

export async function clearDraftMetadata() {
  await AsyncStorage.removeItem(DRAFT_KEY);
}
