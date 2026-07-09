import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import {
  downloadInsuranceClaim,
  generateInsuranceFormHTML,
} from "../../utils/StarHealthPreAuth";
import { mapToStarHealthFormA } from "../../utils/StarHealthMapper";
import { Ionicons } from "@expo/vector-icons";

/**
 * StarHealthPreAuth
 * Layout: form preview (left, flex:1) | buttons panel (right, fixed width)
 * No outer shell — designed to be embedded directly in PARequests Step 5.
 */
export default function StarHealthPreAuth({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();
  const isMobile = width < 1000;

  const formSeed = useMemo(
    () => mapToStarHealthFormA(analysisData),
    [analysisData],
  );

  const [form, setForm] = useState(() => formSeed);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [signatureImage, setSignatureImage] = useState(null);

  const previewFrameRef = useRef(null);
  const [previewFrameHeight, setPreviewFrameHeight] = useState(1400);
  const [editedHtml, setEditedHtml] = useState(null);

  const htmlPreview = useMemo(() => {
    // console.log("form for HTML generation:", form);
    // console.log("signatureImage for HTML generation:", signatureImage);
    return generateInsuranceFormHTML(form, signatureImage);
  }, [form, signatureImage]);

  useEffect(() => {
    setForm(formSeed);
  }, [formSeed]);
  useEffect(() => {
    setEditedHtml(null);
  }, [formSeed]);

  const syncPreviewFrameHeight = useCallback(() => {
    if (Platform.OS !== "web") return;
    const iframe = previewFrameRef.current;
    const doc = iframe?.contentWindow?.document;
    if (!doc) return;
    const body = doc.body;
    const root = doc.documentElement;
    const nextHeight = Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
      root?.scrollHeight || 0,
      root?.offsetHeight || 0,
    );
    if (nextHeight > 0) {
      setPreviewFrameHeight(Math.max(900, Math.ceil(nextHeight) + 20));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !previewMode) return;
    console.log("yaha pahuch gye h1");
    const timer = setTimeout(syncPreviewFrameHeight, 120);
    return () => clearTimeout(timer);
  }, [htmlPreview, previewMode, syncPreviewFrameHeight]);

  const buildDocumentHtml = useCallback((doc) => {
    if (!doc?.documentElement) return null;
    const clone = doc.documentElement.cloneNode(true);
    const sourceInputs = doc.querySelectorAll("input");
    const clonedInputs = clone.querySelectorAll("input");
    sourceInputs.forEach((input, index) => {
      const clonedInput = clonedInputs[index];
      if (!clonedInput) return;
      if (input.type === "checkbox" || input.type === "radio") {
        if (input.checked) clonedInput.setAttribute("checked", "");
        else clonedInput.removeAttribute("checked");
      } else {
        clonedInput.setAttribute("value", input.value ?? "");
      }
    });
    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  }, []);

  const getHtmlOverride = useCallback(() => {
    if (Platform.OS === "web") {
      const iframeDoc = previewFrameRef.current?.contentDocument;
      return buildDocumentHtml(iframeDoc) || editedHtml;
    }
    return editedHtml;
  }, [buildDocumentHtml, editedHtml]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadInsuranceClaim(form, signatureImage, getHtmlOverride());
    } catch (e) {
      Alert.alert(
        "Download Error",
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const fileName =
    analysisData?.structured_data?.source_filename || "StarHealth_PreAuth.pdf";

  // ── BUTTONS PANEL ─────────────────────────────────────────────────────────
  const ButtonsPanel = () => (
    <View style={styles.buttonsPanel}>
      {/* Open in editor */}
      <TouchableOpacity style={styles.outlineBtn}>
        <Text style={styles.outlineText}>Open in editor</Text>
      </TouchableOpacity>

      {/* Download */}
      <TouchableOpacity
        style={[styles.primaryBtn, isDownloading && { opacity: 0.6 }]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Download updated claim</Text>
        )}
      </TouchableOpacity>

      {/* Analyze another */}
      <TouchableOpacity style={styles.greenOutlineBtn}>
        <Text style={styles.greenOutlineText}>Analyze another claim</Text>
      </TouchableOpacity>

      {/* Set up integration */}
      <TouchableOpacity style={styles.greenBtn}>
        <Text style={styles.greenText}>Set up date Integration</Text>
      </TouchableOpacity>
    </View>
  );

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <View style={styles.root}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Star Health pre-auth form generated. Review below, make any final
            edits, then download.
          </Text>
        </View>

        {/* File name */}
        <View style={styles.fileHeader}>
          <Ionicons name="document-text" size={18} color="#1976D2" />
          <Text style={styles.fileName}>{fileName}</Text>
        </View>

        {/* Form scroll */}
        {/* Form preview */}
        {Platform.OS === "web" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={{ width: "100%" }}
          >
            <iframe
              ref={previewFrameRef}
              srcDoc={htmlPreview}
              onLoad={syncPreviewFrameHeight}
              style={{
                width: "210mm",
                height: previewFrameHeight,
                border: "none",
                display: "block",
                backgroundColor: "#fff",
              }}
              title="Star Health Pre-Auth Preview (Mobile)"
            />
          </ScrollView>
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlPreview }}
            style={{ width: "100%", height: 600 }}
            scalesPageToFit={Platform.OS === "android"}
          />
        )}

        {/* Buttons below on mobile */}
        <View style={{ paddingTop: 16 }}>
          <ButtonsPanel />
        </View>
      </View>
    );
  }

  // ── WEB / DESKTOP LAYOUT: form left | buttons right ───────────────────────
  return (
    <View style={styles.root}>
      {/* Info banner — full width above the two-column row */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Star Health pre-auth form generated. Review below, make any final
          edits, then download.
        </Text>
      </View>

      {/* Two-column row */}
      <View style={styles.contentRow}>
        {/* LEFT — form card */}
        <View style={styles.formCol}>
          {/* Card header */}
          <View style={styles.fileHeader}>
            <View style={styles.fileNameRow}>
              <Ionicons name="document-text" size={18} color="#1976D2" />
              <Text style={styles.fileName}>{fileName}</Text>
            </View>
            {/* <TouchableOpacity
              onPress={() => setPreviewMode((p) => !p)}
              style={styles.toggleBtn}
            >
              <Text style={styles.toggleBtnText}>
                {previewMode ? "Edit Fields" : "Preview"}
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Preview iframe */}
          {previewMode ? (
            <View style={styles.iframeWrapper}>
              <iframe
                ref={previewFrameRef}
                srcDoc={htmlPreview}
                onLoad={syncPreviewFrameHeight}
                style={{
                  width: "100%",
                  height: previewFrameHeight,
                  border: "none",
                  display: "block",
                  backgroundColor: "#fff",
                }}
                title="Star Health Pre-Auth Preview"
              />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={{ fontSize: 13, color: "#374151" }}>
                Edit mode coming soon.
              </Text>
            </ScrollView>
          )}
        </View>

        {/* RIGHT — buttons panel */}
        <ButtonsPanel />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
    paddingTop: 8,
  },

  // ── Info banner ────────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
  },

  // ── Two-column row ─────────────────────────────────────────────────────────
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },

  // ── LEFT: form card ────────────────────────────────────────────────────────
  formCol: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  fileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "500",
    marginLeft: 6,
    flexShrink: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
    marginLeft: 10,
  },
  toggleBtnText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  iframeWrapper: {
    width: "100%",
    overflow: "auto",
    backgroundColor: "#fff",
  },

  // ── RIGHT: buttons panel ───────────────────────────────────────────────────
  buttonsPanel: {
    width: 200,
    flexShrink: 0,
    gap: 12,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  greenOutlineBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  greenOutlineText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "500",
  },
  greenBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  greenText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
