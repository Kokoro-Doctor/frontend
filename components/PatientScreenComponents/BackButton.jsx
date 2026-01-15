import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";

export default function BackButton() {
  const navigation = useNavigation();
  const [hovered, setHovered] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[
        styles.button,
        hovered && styles.buttonHover, // hover color
      ]}
      activeOpacity={0.7}
      {...(Platform.OS === "web" && {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      })}
    >
      <Text style={styles.text}>←</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop:"1%",
    marginLeft:"2%",
    marginBottom:"1%",
    width: 48,
    height: 48,
    borderRadius: 24, 
    backgroundColor: "#888888",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer", 
  },
  buttonHover: {
    backgroundColor: "#555555",
  },
  text: {
    fontSize: 28,
    color: "#fff",
    lineHeight: 24,
  },
});
