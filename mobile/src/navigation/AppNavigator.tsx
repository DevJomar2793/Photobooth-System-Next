import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/theme";
import { CameraScreen } from "../screens/CameraScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { PhotoDetailScreen } from "../screens/PhotoDetailScreen";
import { PreviewScreen } from "../screens/PreviewScreen";
import { TemplateSelectionScreen } from "../screens/TemplateSelectionScreen";
import type { BoothStackParamList, GalleryStackParamList, MainTabParamList } from "../types/navigation";

const Tabs = createBottomTabNavigator<MainTabParamList>();
const BoothStack = createNativeStackNavigator<BoothStackParamList>();
const GalleryStack = createNativeStackNavigator<GalleryStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function BoothNavigator() {
  return (
    <BoothStack.Navigator screenOptions={screenOptions}>
      <BoothStack.Screen name="Templates" component={TemplateSelectionScreen} options={{ title: "SnapCapture" }} />
      <BoothStack.Screen name="Camera" component={CameraScreen} options={{ title: "Photo Booth", headerBackVisible: false }} />
      <BoothStack.Screen name="Preview" component={PreviewScreen} options={{ title: "Final Photo", headerBackVisible: false }} />
    </BoothStack.Navigator>
  );
}

function GalleryNavigator() {
  return (
    <GalleryStack.Navigator screenOptions={screenOptions}>
      <GalleryStack.Screen name="Gallery" component={GalleryScreen} options={{ title: "Gallery" }} />
      <GalleryStack.Screen name="PhotoDetail" component={PhotoDetailScreen} options={{ title: "Photo" }} />
    </GalleryStack.Navigator>
  );
}

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.surfaceRaised },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceRaised, height: 66, paddingBottom: 8 },
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={route.name === "Booth" ? "camera" : "image-multiple"} color={color} size={size} />,
        })}
      >
        <Tabs.Screen name="Booth" component={BoothNavigator} />
        <Tabs.Screen name="GalleryTab" component={GalleryNavigator} options={{ title: "Gallery" }} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
