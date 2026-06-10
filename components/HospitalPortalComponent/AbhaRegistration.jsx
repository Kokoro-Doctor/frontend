import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
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
      // contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
      }}
    >
      <Text
        style={[
          s.sectionTitle,
          {
            textAlign: isMobile ? "center" : "left",
            fontSize: isMobile ? 28 : 15,
          },
        ]}
      >
        How would you like to register the patient?
      </Text>

      <View
        style={[
          s.cardRow,
          {
            flexDirection: isMobile ? "column" : "row",
          },
        ]}
      >
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
        {/* <TouchableOpacity
          style={s.methodCard}
          onPress={() => setSelectedMethod("new")}
        > */}
        <TouchableOpacity
          style={[s.methodCard, s.selectedCard]}
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
            {/* <Text style={s.newRegBtnText}>+ New Registration</Text> */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "700",
                  marginRight: 8,
                }}
              >
                +
              </Text>

              <Text style={s.newRegBtnText}>New Registration</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      {/* <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => onBack && onBack()}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, { opacity: 0.4 }]}>
          <Text style={s.continueBtnText}>Continue ›</Text>
        </TouchableOpacity>
      </View> */}
      <View
        style={[
          s.footerRow,
          {
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
          },
        ]}
      >
        {!isMobile && (
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => onBack && onBack()}
          >
            <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[s.continueBtn, { opacity: 0.4 }]}>
          <Text style={s.continueBtnText}>Continue ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────
const s = StyleSheet.create({
  // sectionTitle: {
  //   fontSize: 15,
  //   fontWeight: "600",
  //   color: "#111827",
  //   marginBottom: 20,
  // },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 34,
  },
  cardRow: { gap: 18, marginBottom: 24 },
  // methodCard: {
  //   flex: 1,
  //   borderWidth: 1.5,
  //   borderColor: "#E5E7EB",
  //   borderRadius: 12,
  //   padding: 20,
  //   backgroundColor: "#fff",
  // },
  methodCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 20,
    backgroundColor: "#F9FAFB",
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
  // methodTitle: {
  //   fontSize: 15,
  //   fontWeight: "700",
  //   color: "#111827",
  //   marginBottom: 8,
  // },
  methodTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  // methodDesc: {
  //   fontSize: 12,
  //   color: "#6B7280",
  //   lineHeight: 18,
  //   marginBottom: 16,
  // },
  methodDesc: {
    fontSize: 15,
    color: "#9CA3AF",
    lineHeight: 22,
    marginBottom: 18,
  },
  // fastBtn: {
  //   backgroundColor: "#16A34A",
  //   borderRadius: 8,
  //   paddingHorizontal: 14,
  //   paddingVertical: 8,
  //   alignSelf: "flex-start",
  // },
  fastBtn: {
    backgroundColor: "#22C55E",
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  // fastBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  fastBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // newRegBtn: {
  //   backgroundColor: "#2563EB",
  //   borderRadius: 8,
  //   paddingHorizontal: 14,
  //   paddingVertical: 8,
  //   alignSelf: "flex-start",
  // },
  newRegBtn: {
    backgroundColor: "#22C55E",
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  // newRegBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  newRegBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // footerRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginTop: 16,
  // },
  footerRow: {
    marginTop: 36,
    alignItems: "center",
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  // continueBtn: {
  //   backgroundColor: "#2563EB",
  //   borderRadius: 8,
  //   paddingHorizontal: 24,
  //   paddingVertical: 9,
  // },
  continueBtn: {
    minWidth: 140,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#537ac8ff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  // continueBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  selectedCard: {
    borderColor: "#22C55E",
    borderWidth: 1.5,
  },
});

export default AbhaRegistration;
