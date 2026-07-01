import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
// swap import


// ─── DOCUMENT SECTION CONFIG ───────────────────────────────────
const SECTIONS = [
  {
    key: "abha",
    title: "ABHA Documents",
    subtitle: "Identity and prescription records",
    icon: "📋",
    color: "#F59E0B",
    bg: "#FFF7ED",
    border: "#FDE0B0",
    docs: [{ key: "abha_prescription", label: "Doctor Prescription" }],
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
      { key: "preauth_prescription", label: "Doctor Prescription" },
      { key: "preauth_policy", label: "Insurance Policy" },
    ],
  },
  {
    key: "final",
    title: "Final Auth Documents",
    subtitle: "Billing and clinical evidence",
    icon: "📋",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    docs: [
      { key: "final_prescription_1", label: "Doctor Prescription" },
      { key: "final_prescription_2", label: "Doctor Prescription" },
      { key: "final_prescription_3", label: "Doctor Prescription" },
    ],
  },
];

const TOTAL_DOCS = SECTIONS.reduce((sum, s) => sum + s.docs.length, 0);

// ─── SECTION HEADER ─────────────────────────────────────────────
const SectionHeader = ({ section, uploadedCount, expanded, onToggle }) => (
  <TouchableOpacity
    style={[
      styles.sectionHeader,
      { backgroundColor: section.bg, borderColor: section.border },
    ]}
    onPress={onToggle}
    activeOpacity={0.8}
  >
    <Text style={[styles.chevron, { color: section.color }]}>
      {expanded ? "▾" : "▸"}
    </Text>
    <View
      style={[styles.sectionIconBox, { backgroundColor: section.color }]}
    >
      <Text style={{ fontSize: 14 }}>{section.icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.sectionTitle, { color: section.color }]}>
        {section.title}
      </Text>
      <Text style={styles.sectionSubtitle}>
        {uploadedCount}/{section.docs.length} uploaded · {section.subtitle}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── DOCUMENT ROW ────────────────────────────────────────────────
const DocRow = ({ doc, docState, onToggleCheck, onUpload, isLast }) => {
  const uploaded = !!docState?.uploaded;
  return (
    <View style={[styles.docRow, !isLast && styles.docRowBorder]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggleCheck(doc.key)}
      >
        {uploaded && <View style={styles.checkboxTick} />}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{doc.label}</Text>
        <Text
          style={[
            styles.docSubLabel,
            uploaded && { color: "#16A34A" },
          ]}
        >
          {uploaded ? `✓ File uploaded — ${docState.name || "ready"}` : "No file chosen"}
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
const PatientDetails = ({ patient, onBack }) => {
  const [docs, setDocs] = useState({});
  const [expanded, setExpanded] = useState({
    abha: true,
    preauth: true,
    final: true,
  });

  const toggleSection = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleUpload = (docKey) => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDocs((prev) => ({
          ...prev,
          [docKey]: { file, name: file.name, uploaded: true },
        }));
      };
      input.click();
    } else {
      // mobile picker would go here (react-native-document-picker)
      setDocs((prev) => ({
        ...prev,
        [docKey]: { uploaded: true, name: "document.pdf" },
      }));
    }
  };

  const toggleCheck = (docKey) => {
    setDocs((prev) => ({
      ...prev,
      [docKey]: { ...prev[docKey], uploaded: !prev[docKey]?.uploaded },
    }));
  };

  const uploadedTotal = Object.values(docs).filter((d) => d?.uploaded).length;
  const progressPct = TOTAL_DOCS === 0 ? 0 : uploadedTotal / TOTAL_DOCS;

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Patient Management</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Back to home</Text>
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
          Patient ID: {patient?.id || "—"} · Complete all sections to submit
          the claim
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

        {/* SECTIONS */}
        {SECTIONS.map((section) => {
          const uploadedCount = section.docs.filter(
            (d) => docs[d.key]?.uploaded
          ).length;
          return (
            <View key={section.key} style={styles.sectionBlock}>
              <SectionHeader
                section={section}
                uploadedCount={uploadedCount}
                expanded={expanded[section.key]}
                onToggle={() => toggleSection(section.key)}
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
                      onToggleCheck={toggleCheck}
                      onUpload={handleUpload}
                      isLast={i === section.docs.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* FOOTER ACTIONS */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.saveDraftBtn}>
            <Text style={styles.saveDraftBtnText}>Save draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Claim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── STYLES ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
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
  pageSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 4, marginBottom: 16 },

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
  patientName: { fontSize: 15, fontWeight: "700", color: "#111827", marginRight: 8 },
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
  progressCount: { fontSize: 12, color: "#374151", marginTop: 10, fontWeight: "600" },

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
});

export default PatientDetails;