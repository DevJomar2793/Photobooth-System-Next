export interface GalleryImage {
  id: number;
  filename: string;
  original_name: string | null;
  user: string | null;
  captured_at: string | null;
  width: number;
  height: number;
  file_size: number;
  url: string;
}

export interface UploadImageResponse {
  message: string;
  image: GalleryImage;
}

export interface MessageResponse {
  message: string;
}

export type GallerySort = "newest" | "oldest" | "user";
