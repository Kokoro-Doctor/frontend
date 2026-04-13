import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SignaturePad from "../../components/SignaturePad";

const SignatureScreen = ({ navigation, route }) => {
  const { onSave } = route.params || {};

  const handleSave = (uri) => {
    if (onSave) {
      onSave(uri);
    }
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1B4F72" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Draw Your Signature</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionRow}>
        <Ionicons name="information-circle-outline" size={16} color="#888" />
        <Text style={styles.instructionText}>
          Use your {Platform.OS === "web" ? "mouse or trackpad" : "finger"} to draw your signature in the box below
        </Text>
      </View>

      {/* Signature Pad */}
      <View style={styles.padContainer}>
        <SignaturePad onSave={handleSave} onCancel={handleCancel} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#1B4F72",
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 30,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  padContainer: {
    flex: 1,
    padding: 20,
  },
});

export default SignatureScreen;
