import React, { useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

const SignaturePad = ({ onSave, onCancel }) => {
  const sigRef = useRef(null);

  const handleConfirm = () => {
    if (sigRef.current) {
      sigRef.current.readSignature();
    }
  };

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clearSignature();
    }
  };

  // Injects CSS to hide the built-in buttons and style the canvas area
  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      margin: 0;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      background-color: #fff;
    }
  `;

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <SignatureCanvas
          ref={sigRef}
          onOK={onSave}
          onEmpty={() => {}}
          descriptionText=""
          clearText="Clear"
          confirmText="Save"
          webStyle={webStyle}
          autoClear={false}
          imageType="image/png"
          trimWhitespace
          penColor="#111111"
          minWidth={0.8}
          maxWidth={2.8}
          style={styles.canvas}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  canvasWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    minHeight: 250,
  },
  canvas: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  confirmButton: {
    backgroundColor: "#1B4F72",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#999",
  },
});

export default SignaturePad;
