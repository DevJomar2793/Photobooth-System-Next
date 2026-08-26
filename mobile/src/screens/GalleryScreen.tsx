import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Dialog, Portal, Searchbar, SegmentedButtons, Text } from "react-native-paper";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { OfflineBanner } from "../components/OfflineBanner";
import { PhotoCard } from "../components/PhotoCard";
import { colors } from "../constants/theme";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { deleteImage, listImages } from "../services/api/images";
import { ApiError } from "../services/api/errors";
import type { GalleryImage, GallerySort } from "../types/api";
import type { GalleryStackParamList } from "../types/navigation";
import { filterAndSortImages } from "../utils/gallery";

type Props = NativeStackScreenProps<GalleryStackParamList, "Gallery">;
const PAGE_SIZE = 12;

export function GalleryScreen({ navigation }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<GallerySort>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();

  const fetchImages = useCallback(async (refresh = false) => {
    if (isOffline) {
      setError("Connect to the internet to load the gallery.");
      setIsLoading(false);
      return;
    }
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      setImages(await listImages());
      setVisibleCount(PAGE_SIZE);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The gallery could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOffline]);

  useFocusEffect(useCallback(() => {
    void fetchImages();
  }, [fetchImages]));

  const filtered = useMemo(() => filterAndSortImages(images, search, sort), [images, search, sort]);
  const visibleImages = filtered.slice(0, visibleCount);

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting || isOffline) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteImage(deleteTarget.id);
      setImages((current) => current.filter((image) => image.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The photo could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState label="Fetching photos…" />;

  return (
    <View style={styles.page}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text variant="headlineMedium">Your photos</Text>
        <Text style={styles.muted}>{filtered.length} photos</Text>
        <Searchbar placeholder="Search name or user" value={search} onChangeText={(value) => { setSearch(value); setVisibleCount(PAGE_SIZE); }} />
        <SegmentedButtons
          value={sort}
          onValueChange={(value) => { setSort(value as GallerySort); setVisibleCount(PAGE_SIZE); }}
          buttons={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "user", label: "User" },
          ]}
        />
        {error && <ErrorMessage message={error} onRetry={() => void fetchImages()} />}
      </View>

      <FlatList
        data={visibleImages}
        keyExtractor={(image) => `${image.id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PhotoCard
            image={item}
            onOpen={() => navigation.navigate("PhotoDetail", { imageId: item.id })}
            onDelete={() => setDeleteTarget(item)}
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void fetchImages(true)} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title={search ? "No matching photos" : "No photos yet"} message={search ? "Try another search." : "Create your first booth photo from the Booth tab."} />}
        ListFooterComponent={visibleCount < filtered.length ? <Button onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load more</Button> : null}
      />

      <Portal>
        <Dialog visible={Boolean(deleteTarget)} onDismiss={() => !isDeleting && setDeleteTarget(null)}>
          <Dialog.Title>Delete photo?</Dialog.Title>
          <Dialog.Content><Text>This permanently removes “{deleteTarget?.original_name || "Untitled"}”.</Text></Dialog.Content>
          <Dialog.Actions>
            <Button disabled={isDeleting} onPress={() => setDeleteTarget(null)}>Cancel</Button>
            <Button textColor={colors.danger} loading={isDeleting} disabled={isOffline} onPress={() => void confirmDelete()}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, gap: 12 },
  muted: { color: colors.muted },
  list: { padding: 12, gap: 12, flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },
});
