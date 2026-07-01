import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import {
  listPatientDocuments,
  uploadPatientDocuments,
} from "../../utils/HospitalStaffDocsService";

const DOC_TYPE_OPTIONS = [
  "LAB_REPORT",
  "SCAN_REPORT",
  "PRESCRIPTION",
  "INSURANCE_POLICY",
  "HOSPITAL_BILL",
  "HOSPITAL_RECORD",
  "OTHER",
];

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch (_) {
    return iso;
  }
};

// ─── Small inline dropdown for choosing a doc_type ─────────────
const DocTypeDropdown = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative", zIndex: open ? 999 : 1, minWidth: 140 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#D1D5DB",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 7,
          backgroundColor: "#fff",
        }}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={{ fontSize: 12, color: "#374151", flex: 1 }}>{value}</Text>
        <Text style={{ color: "#6B7280", fontSize: 11 }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 8,
            paddingVertical: 4,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {DOC_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={{ paddingVertical: 7, paddingHorizontal: 10 }}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: value === opt ? "#2563EB" : "#374151",
                  fontWeight: value === opt ? "700" : "400",
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Popup for viewing and uploading a patient's documents, without leaving
 * the patient list. Backed by:
 *   GET  /hospitals/staff/patients/{user_id}/documents
 *   POST /hospitals/staff/patients/{user_id}/documents
 */
const PatientDocumentsModal = ({ visible, patient, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const userId = patient?.id;

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listPatientDocuments(userId);
      setDocuments(data?.documents || []);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible && userId) {
      setPendingFiles([]);
      setUploadError(null);
      setSuccessMessage("");
      fetchDocuments();
    }
  }, [visible, userId, fetchDocuments]);

  const addPendingFiles = (newFiles) => {
    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  // ── Pick files — web ──
  const pickFilesWeb = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      addPendingFiles(
        files.map((file) => ({
          file,
          filename: file.name,
          docType: "OTHER",
        }))
      );
    };
    input.click();
  };

  // ── Pick files — native ──
  const pickFilesNative = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });
      if (result.canceled || !result.assets?.length) return;
      addPendingFiles(
        result.assets.map((asset) => ({
          file: { uri: asset.uri, mimeType: asset.mimeType },
          filename: asset.name || "document",
          docType: "OTHER",
        }))
      );
    } catch (err) {
      console.warn("Document picker error:", err?.message);
    }
  };

  const pickFiles = () =>
    Platform.OS === "web" ? pickFilesWeb() : pickFilesNative();

  const updatePendingDocType = (index, docType) => {
    setPendingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, docType } : f))
    );
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!userId || pendingFiles.length === 0) return;
    try {
      setUploading(true);
      setUploadError(null);
      await uploadPatientDocuments(userId, pendingFiles);
      setPendingFiles([]);
      setSuccessMessage("Document(s) uploaded successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchDocuments();
    } catch (err) {
      setUploadError(err.message || "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const openDownload = (url) => {
    if (!url) return;
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 640,
            maxHeight: "88%",
            backgroundColor: "#fff",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
                Documents
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                {patient?.name} · {patient?.id}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#374151" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Existing documents */}
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 10 }}>
              Uploaded Documents
            </Text>

            {loading && (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator color="#2563EB" />
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
                  Loading documents...
                </Text>
              </View>
            )}

            {!loading && error && (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#DC2626", fontSize: 12 }}>{error}</Text>
                <TouchableOpacity onPress={fetchDocuments} style={{ marginTop: 6 }}>
                  <Text style={{ color: "#2563EB", fontSize: 12, fontWeight: "600" }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && documents.length === 0 && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderStyle: "dashed",
                  borderRadius: 10,
                  paddingVertical: 24,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>📄</Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  No documents uploaded yet
                </Text>
              </View>
            )}

            {!loading &&
              !error &&
              documents.map((doc) => (
                <View
                  key={doc.file_id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 10 }}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}
                      numberOfLines={1}
                    >
                      {doc.filename}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                      {doc.document_category || doc.doc_type || "OTHER"} ·{" "}
                      {doc.source === "HOSPITAL" ? "Hospital" : "Patient"} ·{" "}
                      {formatDate(doc.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openDownload(doc.download_url)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#BFDBFE",
                      backgroundColor: "#EFF6FF",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "600" }}>
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

            {/* Upload new documents */}
            <View
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 10 }}>
                Upload New Document
              </Text>

              <TouchableOpacity
                onPress={pickFiles}
                style={{
                  borderWidth: 1.5,
                  borderColor: "#BFDBFE",
                  borderStyle: "dashed",
                  borderRadius: 10,
                  backgroundColor: "#F0F7FF",
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 12, color: "#1D4ED8", fontWeight: "700" }}>
                  + Choose Files
                </Text>
                <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                  PDF / JPG / PNG
                </Text>
              </TouchableOpacity>

              {pendingFiles.map((pf, index) => (
                <View
                  key={`${pf.filename}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{ flex: 1, fontSize: 12, color: "#374151" }}
                    numberOfLines={1}
                  >
                    {pf.filename}
                  </Text>
                  <DocTypeDropdown
                    value={pf.docType}
                    onSelect={(v) => updatePendingDocType(index, v)}
                  />
                  <TouchableOpacity
                    onPress={() => removePendingFile(index)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#EF4444",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {uploadError && (
                <Text style={{ color: "#DC2626", fontSize: 12, marginBottom: 8 }}>
                  {uploadError}
                </Text>
              )}
              {successMessage !== "" && (
                <Text style={{ color: "#15803D", fontSize: 12, marginBottom: 8 }}>
                  {successMessage}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleUpload}
                disabled={pendingFiles.length === 0 || uploading}
                style={{
                  backgroundColor:
                    pendingFiles.length === 0 || uploading ? "#93C5FD" : "#2563EB",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {uploading && <ActivityIndicator color="#fff" size="small" />}
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                  {uploading
                    ? "Uploading..."
                    : `Upload${pendingFiles.length ? ` (${pendingFiles.length})` : ""}`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PatientDocumentsModal;
