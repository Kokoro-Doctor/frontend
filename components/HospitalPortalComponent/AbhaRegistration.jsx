import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import AbhaExistingPatient from "./AbhaExistingPatient";
import AbhaNewPatient from "./AbhaNewPatient";

// ─── ABHA REGISTRATION ────────────────────────────────────────
// Responsibility: sirf card selection.
//   Card 1 ("Already has ABHA ID") → AbhaExistingPatient
//   Card 2 ("Create ABHA ID")       → AbhaNewPatient
//
// Props:
//   onBack : fn — topmost "Back" press pe parent screen pe wapas

const AbhaRegistration = ({ onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState(null); // 'existing' | 'new' | null

  // ── Card 1 ──────────────────────────────────────────────────
  if (selectedMethod === "existing") {
    return <AbhaExistingPatient onBack={() => setSelectedMethod(null)} />;
  }

  // ── Card 2 ──────────────────────────────────────────────────
  if (selectedMethod === "new") {
    return (
      <AbhaNewPatient
        onBack={() => setSelectedMethod(null)}
        onFlowComplete={(patientData) => {
          // TODO: wire to Patient Details step (Step 3 in outer flow)
          console.log("ABHA created, patient data:", patientData);
        }}
      />
    );
  }

  // ── Default: card selection ───────────────────────────────
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <Text style={s.sectionTitle}>
        How would you like to register the patient?
      </Text>

      <View style={s.cardRow}>
        {/* Card 1 — Already has ABHA */}
        <TouchableOpacity
          style={s.methodCard}
          onPress={() => setSelectedMethod("existing")}
        >
          <View style={s.methodIcon}>
            <Text style={{ fontSize: 24 }}>🪪</Text>
          </View>
          <Text style={s.methodTitle}>Already has ABHA ID</Text>
          <Text style={s.methodDesc}>
            Patient already has an Ayushman Bharat Health Account. Verify via
            OTP and auto-fetch all demographics instantly.
          </Text>
          <View style={s.fastBtn}>
            <Text style={s.fastBtnText}>Fastest and Recommended</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2 — Create ABHA */}
        <TouchableOpacity
          style={s.methodCard}
          onPress={() => setSelectedMethod("new")}
        >
          <View style={s.methodIcon}>
            <Text style={{ fontSize: 24 }}>🆕</Text>
          </View>
          <Text style={s.methodTitle}>Create ABHA ID</Text>
          <Text style={s.methodDesc}>
            New patient — register on ABDM using Aadhaar OTP or Driving Licence.
            Health ID issued instantly.
          </Text>
          <View style={s.newRegBtn}>
            <Text style={s.newRegBtnText}>+ New Registration</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => onBack && onBack()}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, { opacity: 0.4 }]}>
          <Text style={s.continueBtnText}>Continue ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────
const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  cardRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  methodCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  methodDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  fastBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  fastBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  newRegBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  newRegBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  continueBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  continueBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

export default AbhaRegistration;
