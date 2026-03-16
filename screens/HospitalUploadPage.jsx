import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  requestPresignedUrlsBatch,
  uploadToS3,
  confirmUploadBatch,
} from "../utils/HospitalUploadService";
import { HOSPITAL_API_KEY } from "../env-vars";

const HospitalUploadPage = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = isWeb && width >= 768;

  const [apiKey, setApiKey] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState([]);

  const fileInputRef = useRef(null);

  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n${message || ""}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSelectFiles = async () => {
    if (isWeb) {
      fileInputRef.current?.click();
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const files = result.assets.map((asset) => ({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType || "application/octet-stream",
        size: asset.size ?? 0,
      }));
      setSelectedFiles(files);
      setError(null);
    } catch (err) {
      setError("Failed to select files");
    }
  };

  const handleWebFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const mapped = files.map((file) => ({
      name: file.name,
      file,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }));
    setSelectedFiles(mapped);
    setError(null);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setError(null);
    setSuccess(null);
    setConfirmedIds([]);

    if (!hospitalId.trim()) {
      setError("Please enter Hospital ID");
      return;
    }
    if (!patientId.trim()) {
      setError("Please enter Patient ID");
      return;
    }
    if (selectedFiles.length === 0) {
      setError("Please select at least one file");
      return;
    }
    const keyToUse = apiKey.trim() || HOSPITAL_API_KEY;
    if (!keyToUse) {
      setError("Please enter your Hospital API key.");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Request presigned URLs (batch)
      setUploadStep("Requesting upload URLs...");
      const { uploads } = await requestPresignedUrlsBatch(
        keyToUse,
        hospitalId.trim(),
        patientId.trim(),
        selectedFiles.map((f) => ({ filename: f.name })),
      );

      if (uploads.length === 0) {
        throw new Error("No valid upload URLs received. Check file types.");
      }

      // Step 2: Upload each file to S3
      for (let i = 0; i < uploads.length; i++) {
        const item = uploads[i];
        setUploadStep(
          `Uploading ${i + 1}/${uploads.length}: ${item.filename}...`,
        );
        const fileObj = selectedFiles[i];
        const contentType = fileObj.mimeType || "application/octet-stream";
        const fileForUpload = isWeb ? fileObj.file : fileObj;
        await uploadToS3(item.upload_url, fileForUpload, contentType);
      }

      // Step 3: Confirm uploads (batch)
      setUploadStep("Confirming uploads...");
      const fileByNames = Object.fromEntries(
        selectedFiles.map((f) => [f.name, f]),
      );
      const confirmPayload = uploads.map((item) => ({
        file_id: item.file_id,
        filename: item.filename,
        file_size: fileByNames[item.filename]?.size,
      }));
      const { confirmed, errors } = await confirmUploadBatch(
        keyToUse,
        hospitalId.trim(),
        patientId.trim(),
        confirmPayload,
      );

      if (errors?.length > 0 && confirmed?.length === 0) {
        throw new Error(errors[0]?.detail || "Confirm failed");
      }

      setSuccess(
        `Upload successful: ${confirmed?.length || 0} file(s) confirmed`,
      );
      setConfirmedIds(confirmed?.map((c) => c.file_id) || []);
      setHospitalId("");
      setPatientId("");
      setSelectedFiles([]);
    } catch (err) {
      const message = err?.message || "Upload failed";
      setError(message);
      showAlert("Upload Error", message);
    } finally {
      setIsUploading(false);
      setUploadStep(null);
    }
  };

  const cardStyle = [styles.card, isWide && styles.cardWide];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={cardStyle}>
          <View style={styles.brandHeader}>
            <Image
              source={require("../assets/Images/KokoroLogo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Kokoro.Doctor</Text>
          </View>
          <Text style={styles.title}>Hospital File Upload</Text>
          <Text style={styles.subtitle}>
            Upload medical files using presigned URLs (supports multiple files)
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Hospital API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your hospital's API key"
              placeholderTextColor="#999"
              editable={!isUploading}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <Text style={styles.label}>Hospital ID</Text>
            <TextInput
              style={styles.input}
              value={hospitalId}
              onChangeText={setHospitalId}
              placeholder="e.g. HOSP_001"
              placeholderTextColor="#999"
              editable={!isUploading}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Patient ID</Text>
            <TextInput
              style={styles.input}
              value={patientId}
              onChangeText={setPatientId}
              placeholder="e.g. PAT_001"
              placeholderTextColor="#999"
              editable={!isUploading}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Files</Text>
            <View style={styles.fileRow}>
              <TouchableOpacity
                style={[styles.fileButton, isUploading && styles.disabled]}
                onPress={handleSelectFiles}
                disabled={isUploading}
              >
                <Text style={styles.fileButtonText}>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Choose files"}
                </Text>
              </TouchableOpacity>
              {isWeb && (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleWebFileChange}
                  style={styles.hiddenInput}
                  accept="*/*"
                  multiple
                />
              )}
            </View>

            {selectedFiles.length > 0 && (
              <View style={styles.fileList}>
                {selectedFiles.map((f, i) => (
                  <View key={i} style={styles.fileItem}>
                    <Text style={styles.fileItemName} numberOfLines={1}>
                      {f.name}
                    </Text>
                    {!isUploading && (
                      <TouchableOpacity
                        onPress={() => removeFile(i)}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
                {confirmedIds.length > 0 && (
                  <Text style={styles.fileIdText}>
                    File IDs: {confirmedIds.join(", ")}
                  </Text>
                )}
              </View>
            )}

            {isUploading && uploadStep && (
              <View style={styles.progressBox}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.progressText}>{uploadStep}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploading && styles.uploadButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    minHeight: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWide: {
    padding: 32,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  brandLogo: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: -8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  fileRow: {
    position: "relative",
  },
  fileButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderStyle: "dashed",
  },
  fileButtonText: {
    fontSize: 14,
    color: "#64748b",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  fileList: {
    marginTop: -8,
    gap: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fileItemName: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
  },
  removeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  removeBtnText: {
    fontSize: 18,
    color: "#dc2626",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  successText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600",
  },
  fileIdText: {
    color: "#15803d",
    fontSize: 13,
    marginTop: 4,
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
  },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#2563eb",
  },
  uploadButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HospitalUploadPage;
