import type { GalleryImage, MessageResponse, UploadImageResponse } from "../../types/api";
import { apiClient, apiUrl } from "./apiClient";

export async function listImages() {
  const response = await apiClient.get<GalleryImage[]>("/api/images");
  return response.data;
}

export async function getImage(imageId: number) {
  const response = await apiClient.get<GalleryImage>(`/api/images/${imageId}`);
  return response.data;
}

export async function uploadImage(uri: string, templateId: string) {
  const originalName = `snapcapture-${templateId}`;
  const form = new FormData();
  form.append("file", {
    uri,
    name: `${originalName}.jpg`,
    type: "image/jpeg",
  } as unknown as Blob);
  form.append("user", "MobileUser");
  form.append("original_name", originalName);

  const response = await apiClient.post<UploadImageResponse>("/api/images/upload", form);
  return response.data;
}

export async function deleteImage(imageId: number) {
  const response = await apiClient.delete<MessageResponse>(`/api/images/${imageId}`);
  return response.data;
}

export function imageUrl(filename: string) {
  return apiUrl(`/uploads/images/${filename}`);
}

export function downloadUrl(imageId: number) {
  return apiUrl(`/api/images/${imageId}/download`);
}
