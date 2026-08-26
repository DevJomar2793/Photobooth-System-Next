import { forwardRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { CapturedShot, PhotoTemplate } from "../types/booth";

interface PhotoCompositionProps {
  template: PhotoTemplate;
  shots: CapturedShot[];
  width: number;
}

export const PhotoComposition = forwardRef<View, PhotoCompositionProps>(
  function PhotoComposition({ template, shots, width }, ref) {
    const height = width * (22 / 16);
    return (
      <View ref={ref} collapsable={false} style={{ width, height, overflow: "hidden" }}>
        <LinearGradient colors={template.backgroundColors} style={StyleSheet.absoluteFill}>
        {template.slots.map((slot) => {
          const shot = shots[slot.id - 1];
          return (
            <View
              key={slot.id}
              style={[
                styles.frame,
                {
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  backgroundColor: template.frameColor,
                  padding: width * 0.011,
                  borderRadius: width * 0.016,
                  transform: [{ rotate: `${slot.rotation ?? 0}deg` }],
                },
              ]}
            >
              {shot && <Image source={{ uri: shot.uri }} resizeMode="cover" style={styles.image} />}
            </View>
          );
        })}

        <View style={[styles.caption, { backgroundColor: template.captionBackground }]}>
          <Text numberOfLines={1} style={[styles.description, { color: template.captionColor, fontSize: width * 0.026 }]}>
            {template.description}
          </Text>
          <Text numberOfLines={1} style={[styles.brand, { color: template.captionColor, fontSize: width * 0.037 }]}>
            SnapCapture Booth
          </Text>
        </View>
        </LinearGradient>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  caption: {
    position: "absolute",
    left: "4%",
    right: "4%",
    bottom: "2.5%",
    height: "8%",
    borderRadius: 18,
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
  description: { fontWeight: "600" },
  brand: { fontWeight: "800" },
});
