import { MD3DarkTheme } from "react-native-paper";

export const colors = {
  background: "#0F1115",
  surface: "#1E232D",
  surfaceRaised: "#2E3545",
  primary: "#10B981",
  accent: "#F5A623",
  text: "#F0F0F2",
  muted: "#9CA3AF",
  danger: "#EF4444",
  success: "#22C55E",
} as const;

export const appTheme = {
  ...MD3DarkTheme,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceRaised,
    onSurface: colors.text,
    onBackground: colors.text,
    error: colors.danger,
  },
};
