import type { NavigatorScreenParams } from "@react-navigation/native";

export type BoothStackParamList = {
  Templates: undefined;
  Camera: undefined;
  Preview: undefined;
};

export type GalleryStackParamList = {
  Gallery: undefined;
  PhotoDetail: { imageId: number };
};

export type MainTabParamList = {
  Booth: NavigatorScreenParams<BoothStackParamList>;
  GalleryTab: NavigatorScreenParams<GalleryStackParamList>;
};
