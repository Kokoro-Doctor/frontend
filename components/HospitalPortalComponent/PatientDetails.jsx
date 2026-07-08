import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
  useWindowDimensions,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import {
  listPatientDocuments,
  uploadPatientDocuments,
} from "../../utils/HospitalStaffDocsService";

// ─── DOCUMENT SECTION CONFIG ───────────────────────────────────
const SECTIONS = [
  {
    key: "abha",
    title: "ABHA Documents",
    subtitle: "Identity and prescription records",
    icon: "📋",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF0CE",
    docs: [
      {
        key: "abha_prescription",
        label: "Doctor Prescription",
        docType: "PRESCRIPTION",
      },
    ],
  },
  {
    key: "preauth",
    title: "Pre-auth Documents",
    subtitle: "Insurance pre-authorisation Policy",
    icon: "📋",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF0CE",
    docs: [
      {
        key: "preauth_prescription",
        label: "Doctor Prescription",
        docType: "PRESCRIPTION",
      },
      {
        key: "preauth_policy",
        label: "Insurance Policy",
        docType: "INSURANCE_POLICY",
      },
    ],
  },
  {
    key: "final",
    title: "Final Auth Documents",
    subtitle: "Billing and clinical evidence",
    icon: "📋",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF0CE",
    docs: [
      {
        key: "final_prescription_1",
        label: "Hospital Bill",
        docType: "HOSPITAL_BILL",
      },
      {
        key: "final_prescription_2",
        label: "Insurance Policy",
        docType: "INSURANCE_POLICY",
      },
      {
        key: "final_prescription_3",
        label: "Doctor Prescription",
        docType: "PRESCRIPTION",
      },
    ],
  },
];

const PENDING_STYLE = {
  color: "#6B7280",
  bg: "#F0F6FF",
  border: "#E5E7EB",
};

// ─── SECTION HEADER ─────────────────────────────────────────────
const SectionHeader = ({
  section,
  uploadedCount,
  expanded,
  onToggle,
  actionButton,
}) => {
  const total = section.docs.length;

  const isComplete = total > 0 && uploadedCount === total;
  const colors = isComplete
    ? { color: section.color, bg: section.bg, border: section.border }
    : PENDING_STYLE;

  return (
    <TouchableOpacity
      style={[
        styles.sectionHeader,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={[styles.chevron, { color: colors.color }]}>
        {expanded ? "▾" : "▸"}
      </Text>
      <View style={[styles.sectionIconBox, { backgroundColor: colors.color }]}>
        <Text style={{ fontSize: 14 }}>{section.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: colors.color }]}>
          {section.title}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {uploadedCount}/{total} uploaded · {section.subtitle}
        </Text>
      </View>
      {actionButton}
    </TouchableOpacity>
  );
};

// ─── DOCUMENT ROW ────────────────────────────────────────────────
const DocRow = ({ doc, docState, onUpload, isLast }) => {
  const uploaded = !!docState?.uploaded;
  return (
    <View style={[styles.docRow, !isLast && styles.docRowBorder]}>
      <View style={styles.checkbox}>
        {uploaded && <View style={styles.checkboxTick} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{doc.label}</Text>
        <Text style={[styles.docSubLabel, uploaded && { color: "#16A34A" }]}>
          {uploaded
            ? `✓ File uploaded — ${docState.name || "ready"}`
            : "No file chosen"}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          uploaded ? styles.actionBtnUploaded : styles.actionBtnUpload,
        ]}
        onPress={() => onUpload(doc.key)}
      >
        <Text
          style={[
            styles.actionBtnText,
            uploaded ? { color: "#16A34A" } : { color: "#374151" },
          ]}
        >
          {uploaded ? "Uploaded" : "Upload"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────
const PatientDetails = ({ route, navigation }) => {
  const { patient, preloadedDocuments } = route.params || {};
  const onBack = () => navigation.goBack();
  const [preAuthPopupVisible, setPreAuthPopupVisible] = useState(false);
  const [docs, setDocs] = useState({});
  const [otherDocs, setOtherDocs] = useState([]); // dynamic "Other Documents" list
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [preAuthLoading, setPreAuthLoading] = useState(false);
  const [finalAuthPopupVisible, setFinalAuthPopupVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isMobileLayout = Platform.OS !== "web" || width < 1000;

  const userId = patient?.id;

  const mapDocuments = useCallback((fetched) => {
    const newDocs = {};
    const matchedIds = new Set();

    SECTIONS.forEach((section) => {
      section.docs.forEach((slot) => {
        const match = fetched.find(
          (d) => (d.document_category || d.doc_type) === slot.docType,
        );
        if (match) {
          newDocs[slot.key] = {
            uploaded: true,
            name: match.filename,
            download_url: match.download_url,
            file_id: match.file_id,
          };
          matchedIds.add(match.file_id);
        }
      });
    });

    const leftover = fetched
      .filter((d) => !matchedIds.has(d.file_id))
      .map((d) => ({
        key: d.file_id,
        label: d.filename,
        uploaded: true,
        name: d.filename,
        download_url: d.download_url,
        file_id: d.file_id,
      }));

    return { newDocs, leftover };
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;
    try {
      setDocsLoading(true);
      setDocsError(null);
      const data = await listPatientDocuments(userId);
      const fetched = data?.documents || [];
      const { newDocs, leftover } = mapDocuments(fetched);
      setDocs(newDocs);
      setOtherDocs(leftover);
    } catch (err) {
      setDocsError(err.message || "Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  }, [userId, mapDocuments]);

  useEffect(() => {
    if (preloadedDocuments) {
      const { newDocs, leftover } = mapDocuments(preloadedDocuments);
      setDocs(newDocs);
      setOtherDocs(leftover);
      // no fetchDocuments() call needed — data is already correct
    } else {
      fetchDocuments();
    }
  }, [fetchDocuments, mapDocuments, preloadedDocuments]);

  const [expanded, setExpanded] = useState({
    abha: true,
    preauth: true,
    final: true,
    other: true,
  });

  const toggleSection = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

 const handleUpload = async (docKey) => {
  const slot = SECTIONS.flatMap((s) => s.docs).find((d) => d.key === docKey);
  if (Platform.OS === "web") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await uploadPatientDocuments(userId, [
          { file, filename: file.name, docType: slot?.docType || "OTHER" },
        ]);
        await fetchDocuments();
      } catch (err) {
        alert(err.message || "Upload failed");
      }
    };
    input.click();
  } else {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        name: asset.name || "document.pdf",
        type: asset.mimeType || "application/octet-stream",
      };

      await uploadPatientDocuments(userId, [
        { file, filename: file.name, docType: slot?.docType || "OTHER" },
      ]);
      await fetchDocuments();
    } catch (err) {
      alert(err.message || "Upload failed");
    }
  }
};

  const handleGoToPreAuth = (isComplete) => {
    if (!isComplete) {
      setPreAuthPopupVisible(true);
      return;
    }
    navigation.navigate("PARequests", {
      preselectedPatient: patient, // pass the full object, not just the id
      skipToStep2: true,
    });
  };
  const handleGoToFinalAuth = (isComplete) => {
    if (!isComplete) {
      setFinalAuthPopupVisible(true);
      return;
    }
    navigation.navigate("HospitalInsuranceClaim", {
      preselectedPatientId: patient.id,
      preselectedInsurerName: patient.insurer || null, // ← NEW
      skipToStep2: true,
    });
  };

  const handleAddOtherDocument = async () => {
  if (Platform.OS === "web") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await uploadPatientDocuments(userId, [
          { file, filename: file.name, docType: "OTHER" },
        ]);
        await fetchDocuments();
      } catch (err) {
        alert(err.message || "Upload failed");
      }
    };
    input.click();
  } else {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        name: asset.name || "document.pdf",
        type: asset.mimeType || "application/octet-stream",
      };

      await uploadPatientDocuments(userId, [
        { file, filename: file.name, docType: "OTHER" },
      ]);
      await fetchDocuments();
    } catch (err) {
      alert(err.message || "Upload failed");
    }
  }
};

 

  const fixedTotal = SECTIONS.reduce((sum, s) => sum + s.docs.length, 0);
  const TOTAL_DOCS = fixedTotal + otherDocs.length;

  const fixedUploaded = Object.values(docs).filter((d) => d?.uploaded).length;
  const otherUploaded = otherDocs.filter((d) => d.uploaded).length;
  const uploadedTotal = fixedUploaded + otherUploaded;

  const progressPct = TOTAL_DOCS === 0 ? 0 : uploadedTotal / TOTAL_DOCS;

  // ── The card content ──
  const renderCard = () => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Patient Management</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        {/* TITLE */}
        <Text style={styles.pageTitle}>
          Upload documents — {patient?.name || "Patient"}
        </Text>
        <Text style={styles.pageSubtitle}>
          Patient ID: {patient?.id || "—"} · Complete all sections to submit the
          claim
        </Text>

        {/* PATIENT + PROGRESS ROW */}
        <View style={styles.topRow}>
          {/* Patient card */}
          <View style={styles.patientCard}>
            <View style={styles.patientCardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(patient?.initials || "PT").slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.patientName}>
                    {patient?.name || "Unknown Patient"}
                  </Text>
                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeBadgeText}>Admission Active</Text>
                  </View>
                </View>
                <Text style={styles.patientId}>{patient?.id || "—"}</Text>
              </View>
              <Text style={styles.userFrom}>
                User from · {patient?.admitted || "—"}
              </Text>
            </View>

            <View style={styles.patientMetaRow}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Admitted</Text>
                <Text style={styles.metaValue}>{patient?.admitted || "—"}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Age</Text>
                <Text style={styles.metaValue}>{patient?.age || "—"} yrs</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Insurer</Text>
                <Text style={[styles.metaValue, styles.metaLink]}>
                  {patient?.insurer || "—"}
                </Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Ward</Text>
                <Text style={[styles.metaValue, styles.metaLink]}>
                  {patient?.ward || "General"}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress card */}
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Overall upload progress</Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPct * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {uploadedTotal} of {TOTAL_DOCS} documents
            </Text>
          </View>
        </View>

        {/* FIXED SECTIONS */}
        {/* FIXED SECTIONS */}
        {SECTIONS.map((section) => {
          const uploadedCount = section.docs.filter(
            (d) => docs[d.key]?.uploaded,
          ).length;
          const isComplete = uploadedCount === section.docs.length;
          return (
            <View key={section.key} style={styles.sectionBlock}>
              <SectionHeader
                section={section}
                uploadedCount={uploadedCount}
                expanded={expanded[section.key]}
                onToggle={() => toggleSection(section.key)}
                actionButton={
                  section.key === "preauth" ? (
                    <TouchableOpacity
                      style={[
                        styles.goToPreAuthBtn,
                        !isComplete && styles.goToPreAuthBtnDisabled,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleGoToPreAuth(isComplete);
                      }}
                    >
                      <Text
                        style={[
                          styles.goToPreAuthBtnText,
                          !isComplete && styles.goToPreAuthBtnTextDisabled,
                        ]}
                      >
                        Go to Pre-Auth
                      </Text>
                    </TouchableOpacity>
                  ) : section.key === "final" ? ( // ← add this branch
                    <TouchableOpacity
                      style={[
                        styles.goToPreAuthBtn,
                        !isComplete && styles.goToPreAuthBtnDisabled,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleGoToFinalAuth(isComplete);
                      }}
                    >
                      <Text
                        style={[
                          styles.goToPreAuthBtnText,
                          !isComplete && styles.goToPreAuthBtnTextDisabled,
                        ]}
                      >
                        Go to Final Auth
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
              {expanded[section.key] && (
                <View style={styles.sectionBody}>
                  <View style={styles.docsTableHeader}>
                    <Text style={styles.docsTableHeaderText}>Documents</Text>
                    <Text style={styles.docsTableHeaderText}>Action</Text>
                  </View>
                  {section.docs.map((doc, i) => (
                    <DocRow
  key={doc.key}
  doc={doc}
  docState={docs[doc.key]}
  onUpload={handleUpload}
  isLast={i === section.docs.length - 1}
/>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* OTHER DOCUMENTS SECTION (dynamic, user-added) */}
        <View style={styles.sectionBlock}>
          <SectionHeader
            section={{
              title: "Other Documents",
              subtitle: "Any additional supporting files",
              icon: "📋",
              color: "#16A34A",
              bg: "#F0FDF4",
              border: "#BBF0CE",
              docs: otherDocs,
            }}
            uploadedCount={otherUploaded}
            expanded={expanded.other}
            onToggle={() => toggleSection("other")}
          />
          {expanded.other && (
            <View style={styles.sectionBody}>
              <View style={styles.docsTableHeader}>
                <Text style={styles.docsTableHeaderText}>Documents</Text>
                <Text style={styles.docsTableHeaderText}>Action</Text>
              </View>
              {otherDocs.map((doc, i) => (
                <DocRow
                  key={doc.key}
                  doc={doc}
                  docState={doc}
                  onToggleCheck={() => {}}
                  onUpload={() => {}}
                  isLast={i === otherDocs.length - 1}
                />
              ))}
              <TouchableOpacity
                style={styles.addOtherDocBtn}
                onPress={handleAddOtherDocument}
              >
                <Text style={styles.addOtherDocBtnText}>+ Add Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={preAuthPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreAuthPopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>🚧 Documents Pending</Text>
            <Text style={styles.popupText}>
              Please upload the documents first to go to Pre-Auth.
            </Text>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setPreAuthPopupVisible(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={finalAuthPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinalAuthPopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>🚧 Documents Pending</Text>
            <Text style={styles.popupText}>
              Please upload all Final Auth documents first to go to Final Auth.
            </Text>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setFinalAuthPopupVisible(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
  const renderMobileCard = () => (
    <View style={mobileStyles.card}>
      {/* HEADER */}
      <View style={mobileStyles.cardHeader}>
        <Text style={mobileStyles.cardTitle}>Patient Management</Text>
        <TouchableOpacity style={mobileStyles.backBtn} onPress={onBack}>
          <Text style={mobileStyles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text style={mobileStyles.pageTitle}>
          Upload documents — {patient?.name || "Patient"}
        </Text>
        <Text style={mobileStyles.pageSubtitle}>
          Patient ID: {patient?.id || "—"} · Complete all sections to submit the
          claim
        </Text>

        {/* PATIENT CARD */}
        <View style={mobileStyles.patientCard}>
          <View style={mobileStyles.patientCardTop}>
            <View style={mobileStyles.avatar}>
              <Text style={mobileStyles.avatarText}>
                {(patient?.initials || "PT").slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={mobileStyles.patientName}>
                {patient?.name || "Unknown Patient"}
              </Text>
              <Text style={mobileStyles.patientId}>{patient?.id || "—"}</Text>
            </View>
            <View style={mobileStyles.activeBadge}>
              <View style={mobileStyles.activeDot} />
              <Text style={mobileStyles.activeBadgeText}>Admission Active</Text>
            </View>
          </View>

          <View style={mobileStyles.patientMetaGrid}>
            <View style={mobileStyles.metaCell}>
              <Text style={mobileStyles.metaLabel}>Admitted</Text>
              <Text style={mobileStyles.metaValue}>
                {patient?.admitted || "—"}
              </Text>
            </View>
            <View style={mobileStyles.metaCell}>
              <Text style={mobileStyles.metaLabel}>Age</Text>
              <Text style={mobileStyles.metaValue}>
                {patient?.age || "—"} yrs
              </Text>
            </View>
            <View style={mobileStyles.metaCell}>
              <Text style={mobileStyles.metaLabel}>Insurer</Text>
              <Text style={[mobileStyles.metaValue, mobileStyles.metaLink]}>
                {patient?.insurer || "—"}
              </Text>
            </View>
            <View style={mobileStyles.metaCell}>
              <Text style={mobileStyles.metaLabel}>Ward</Text>
              <Text style={[mobileStyles.metaValue, mobileStyles.metaLink]}>
                {patient?.ward || "General"}
              </Text>
            </View>
          </View>
        </View>

        {/* PROGRESS CARD */}
        <View style={mobileStyles.progressCard}>
          <Text style={mobileStyles.progressLabel}>
            Overall upload progress
          </Text>
          <View style={mobileStyles.progressBarTrack}>
            <View
              style={[
                mobileStyles.progressBarFill,
                { width: `${progressPct * 100}%` },
              ]}
            />
          </View>
          <Text style={mobileStyles.progressCount}>
            {uploadedTotal} of {TOTAL_DOCS} documents
          </Text>
        </View>

        {/* SECTIONS (reuse same SectionHeader/DocRow components) */}
        {SECTIONS.map((section) => {
          const uploadedCount = section.docs.filter(
            (d) => docs[d.key]?.uploaded,
          ).length;
          const isComplete = uploadedCount === section.docs.length;
          return (
            <View key={section.key} style={styles.sectionBlock}>
              <SectionHeader
                section={section}
                uploadedCount={uploadedCount}
                expanded={expanded[section.key]}
                onToggle={() => toggleSection(section.key)}
                actionButton={
                  section.key === "preauth" ? (
                    <TouchableOpacity
                      style={[
                        styles.goToPreAuthBtn,
                        !isComplete && styles.goToPreAuthBtnDisabled,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleGoToPreAuth(isComplete);
                      }}
                    >
                      <Text
                        style={[
                          styles.goToPreAuthBtnText,
                          !isComplete && styles.goToPreAuthBtnTextDisabled,
                        ]}
                      >
                        Go to Pre-Auth
                      </Text>
                    </TouchableOpacity>
                  ) : section.key === "final" ? (
                    <TouchableOpacity
                      style={[
                        styles.goToPreAuthBtn,
                        !isComplete && styles.goToPreAuthBtnDisabled,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleGoToFinalAuth(isComplete);
                      }}
                    >
                      <Text
                        style={[
                          styles.goToPreAuthBtnText,
                          !isComplete && styles.goToPreAuthBtnTextDisabled,
                        ]}
                      >
                        Go to Final Auth
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
              {expanded[section.key] && (
                <View style={styles.sectionBody}>
                  <View style={styles.docsTableHeader}>
                    <Text style={styles.docsTableHeaderText}>Documents</Text>
                    <Text style={styles.docsTableHeaderText}>Action</Text>
                  </View>
                  {section.docs.map((doc, i) => (
                   <DocRow
  key={doc.key}
  doc={doc}
  docState={docs[doc.key]}
  onUpload={handleUpload}
  isLast={i === section.docs.length - 1}
/>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* OTHER DOCUMENTS */}
        <View style={styles.sectionBlock}>
          <SectionHeader
            section={{
              title: "Other Documents",
              subtitle: "Any additional supporting files",
              icon: "📋",
              color: "#16A34A",
              bg: "#F0FDF4",
              border: "#BBF0CE",
              docs: otherDocs,
            }}
            uploadedCount={otherUploaded}
            expanded={expanded.other}
            onToggle={() => toggleSection("other")}
          />
          {expanded.other && (
            <View style={styles.sectionBody}>
              <View style={styles.docsTableHeader}>
                <Text style={styles.docsTableHeaderText}>Documents</Text>
                <Text style={styles.docsTableHeaderText}>Action</Text>
              </View>
              {otherDocs.map((doc, i) => (
                <DocRow
                  key={doc.key}
                  doc={doc}
                  docState={doc}
                  onToggleCheck={() => {}}
                  onUpload={() => {}}
                  isLast={i === otherDocs.length - 1}
                />
              ))}
              <TouchableOpacity
                style={styles.addOtherDocBtn}
                onPress={handleAddOtherDocument}
              >
                <Text style={styles.addOtherDocBtnText}>+ Add Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals — same as web */}
      <Modal
        visible={preAuthPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreAuthPopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>🚧 Documents Pending</Text>
            <Text style={styles.popupText}>
              Please upload the documents first to go to Pre-Auth.
            </Text>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setPreAuthPopupVisible(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={finalAuthPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinalAuthPopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>🚧 Documents Pending</Text>
            <Text style={styles.popupText}>
              Please upload all Final Auth documents first to go to Final Auth.
            </Text>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setFinalAuthPopupVisible(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ── WEB LAYOUT: sidebar + header + background, matching HospitalPatientManagement ──
  if (Platform.OS === "web" && (width > 1000 || width === 0)) {
    return (
      <View style={layoutStyles.container}>
        <ImageBackground
          source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
          style={layoutStyles.background}
          resizeMode="cover"
        >
          <View style={layoutStyles.overlay} />
          <View style={layoutStyles.main}>
            <View style={layoutStyles.left}>
              <HospitalSidebarNavigation navigation={navigation} />
            </View>
            <View style={layoutStyles.right}>
              <View style={layoutStyles.header}>
                <HeaderLoginSignUp navigation={navigation} />
              </View>
              {renderCard()}
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // ── MOBILE LAYOUT ──
  // ── MOBILE LAYOUT ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      <HeaderLoginSignUp navigation={navigation} />
      <View style={{ flex: 1 }}>{renderMobileCard()}</View>
    </SafeAreaView>
  );
};

// ─── OUTER LAYOUT STYLES (matches HospitalPatientManagement's web layout) ──
const layoutStyles = StyleSheet.create({
  container: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  main: { flexDirection: "row", height: "100%", zIndex: 2 },
  left: { width: "15%" },
  right: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  header: { marginBottom: 0 },
});

// ─── CARD STYLES (full, nothing omitted) ─────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    height: "85vh",
    overflow: "hidden",
    flexDirection: "column",
    minHeight: 500,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 19, fontWeight: "600", color: "#111827" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backBtnText: { fontSize: 14, fontWeight: "500", color: "#555555" },

  pageTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  pageSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 16,
  },

  topRow: { flexDirection: "row", gap: 16, marginBottom: 20 },

  patientCard: {
    flex: 2.6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#fff",
  },
  patientCardTop: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "700", color: "#92400E", fontSize: 15 },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF0CE",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },
  activeBadgeText: { fontSize: 10, color: "#16A34A", fontWeight: "600" },
  patientId: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  userFrom: { fontSize: 11, color: "#9CA3AF" },

  patientMetaRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaCell: { flex: 1 },
  metaLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metaValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  metaLink: { color: "#2563EB" },

  progressCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  progressLabel: { fontSize: 12, color: "#6B7280", marginBottom: 10 },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  progressCount: {
    fontSize: 12,
    color: "#374151",
    marginTop: 10,
    fontWeight: "600",
  },

  sectionBlock: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chevron: { fontSize: 12, marginRight: 10, fontWeight: "700" },
  sectionIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  sectionBody: { backgroundColor: "#fff" },
  docsTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  docsTableHeaderText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  docRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxTick: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#16A34A",
  },
  docLabel: { fontSize: 13, fontWeight: "600", color: "#111827" },
  docSubLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  actionBtn: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
  },
  actionBtnUpload: {
    backgroundColor: "#fff",
    borderColor: "#D1D5DB",
  },
  actionBtnUploaded: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF0CE",
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" },

  addOtherDocBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  addOtherDocBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  footerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  saveDraftBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  saveDraftBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  submitBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  submitBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  goToPreAuthBtn: {
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#2563EB",
    marginLeft: 10,
  },
  goToPreAuthBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  goToPreAuthBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  goToPreAuthBtnTextDisabled: {
    color: "#9CA3AF",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  popupText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  popupBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popupBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
const mobileStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#F1F5F9" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  backBtnText: { fontSize: 13, fontWeight: "500", color: "#555" },

  pageTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 17,
  },

  patientCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  patientCardTop: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "700", color: "#92400E", fontSize: 15 },
  patientName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  patientId: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF0CE",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },
  activeBadgeText: { fontSize: 10, color: "#16A34A", fontWeight: "600" },

  patientMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaCell: { width: "50%", marginBottom: 10 },
  metaLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  metaValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  metaLink: { color: "#2563EB" },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  progressLabel: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  progressCount: {
    fontSize: 12,
    color: "#374151",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "right",
  },
});

export default PatientDetails;
