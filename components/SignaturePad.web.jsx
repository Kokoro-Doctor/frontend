import React, { useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import ReactSignatureCanvas from "react-signature-canvas";

const SignaturePad = ({ onSave, onCancel }) => {
  const sigRef = useRef(null);

  const handleConfirm = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      return;
    }
    // Crop to ink bounds so the PNG is mostly signature pixels — scales up much clearer in the PDF.
    const trimmed = sigRef.current.getTrimmedCanvas();
    const dataURL = trimmed.toDataURL("image/png");
    onSave(dataURL);
  };

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <ReactSignatureCanvas
          ref={sigRef}
          clearOnResize={false}
          minWidth={0.8}
          maxWidth={2.8}
          penColor="#111111"
          canvasProps={{
            style: {
              width: "100%",
              height: "100%",
              borderRadius: 8,
              cursor: "crosshair",
              touchAction: "none",
            },
          }}
          backgroundColor="rgba(255,255,255,1)"
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
