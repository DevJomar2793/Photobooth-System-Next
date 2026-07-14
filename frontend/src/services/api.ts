import axios from "axios";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://atbackend-photobooth-system-next.onrender.com"
    : "")
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: apiBaseUrl || undefined,
});

function backendUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export interface CapturedImage {
  id: number;
  filename: string;
  original_name: string;
  user: string;
  captured_at: string;
  width: number;
  height: number;
  file_size: number;
}

export const api = {
  /** Upload a captured image blob */
  async uploadImage(blob: Blob, user = "Anonymous", originalName = "capture") {
    const formData = new FormData();
    formData.append("file", blob, `${originalName}.jpg`);
    formData.append("user", user);
    formData.append("original_name", originalName);

    const { data } = await apiClient.post<CapturedImage>(
      "/api/images/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  /** List all images */
  async listImages() {
    const { data } = await apiClient.get<CapturedImage[]>("/api/images");
    return data;
  },

  /** Delete an image by ID */
  async deleteImage(id: number) {
    const { data } = await apiClient.delete(`/api/images/${id}`);
    return data;
  },

  /** Download URL (link) */
  downloadUrl(id: number) {
    return backendUrl(`/api/images/${id}/download`);
  },

  /** Full URL for serving an image */
  imageUrl(filename: string) {
    return backendUrl(`/uploads/images/${filename}`);
  },
};
