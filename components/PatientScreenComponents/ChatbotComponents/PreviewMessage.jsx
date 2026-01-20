import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions } from "react-native";
import { useLoginModal } from "../../../contexts/LoginModalContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../../../contexts/Themes";
import FormattedMessageText from "./FormattedMessageText";

const { width: screenWidth } = Dimensions.get("window");
const isLaptopScreen = screenWidth > 768;

const PreviewMessage = ({ previewText, fullText, ctaText, signupAction }) => {
  const { triggerLoginModal } = useLoginModal();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleCTAClick = () => {
    if (signupAction === "signup") {
      triggerLoginModal({ mode: "signup" });
    }
  };

  return (
    <View style={styles.container}>
      {/* Preview text - no blur needed since backend sends only preview */}
      <View style={styles.previewContainer}>
        <FormattedMessageText sender="bot" text={previewText} />
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[
          styles.ctaButton,
          {
            backgroundColor: theme.primary || "#FF7072",
            borderColor: theme.primary || "#FF7072",
          },
        ]}
        onPress={handleCTAClick}
        activeOpacity={0.8}
      >
        <Text style={[styles.ctaText, { color: "#fff" }]}>
          {ctaText || "See full answer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    maxWidth: isLaptopScreen ? 800 : "100%", // Wider for laptop screens
    alignSelf: "center",
  },
  previewContainer: {
    position: "relative",
    paddingBottom: isLaptopScreen ? 12 : 10,
    paddingHorizontal: isLaptopScreen ? 8 : 4,
  },
  ctaButton: {
    marginTop: isLaptopScreen ? 12 : 10,
    paddingVertical: isLaptopScreen ? 14 : 12,
    paddingHorizontal: isLaptopScreen ? 24 : 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    }),
  },
  ctaText: {
    fontSize: isLaptopScreen ? 16 : 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default PreviewMessage;
