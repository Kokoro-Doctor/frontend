import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { API_URL } from "../../env-vars";
import { Calendar } from "react-native-calendars";

const steps = [
  { label: "Choose Method", sub: "API or upload" },
  { label: "Validate & Review", sub: "Check completeness" },
  { label: "Integration Complete", sub: "Dashboard unlocked" },
];

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "Radiology",
  "General Medicine",
  "Surgery",
  "Dermatology",
  "Psychiatry",
];

const EMPTY_FORM = {
  fullName: "",
  department: "",
  nmcNo: "",
  specialization: "",
  experience: "",
  phoneNo: "",
  email: "",
};

const EMPTY_PATIENT_FORM = {
  fullName: "",
  age: "",
  gender: "",
  phoneNo: "",
  policyNo: "",
  insurer: "",
  admissionDate: "",
  diagnosis: "",
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ManualDataIntegration = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(1);

  // ── Form State ──
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [savedDoctors, setSavedDoctors] = useState([]);
  const [lastSaved, setLastSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientForm, setPatientForm] = useState({ ...EMPTY_PATIENT_FORM });
  const [isSavingMobile, setIsSavingMobile] = useState(false);
  const [patientSaved, setPatientSaved] = useState(false);
  const [patientCountMap, setPatientCountMap] = useState({});
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarField, setCalendarField] = useState(null);

  // ── Excel Upload State ──
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // "idle"|"uploading"|"success"|"error"
  const [uploadResult, setUploadResult] = useState(null); // { total_patients, successfully_added, error_count, doctor_imported }
  const [uploadError, setUploadError] = useState("");

  // ── Doctor List View State ──
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  // ─────────────────────────────────────────────
  // FILE PICKER  (web only)
  // ─────────────────────────────────────────────
  
  const openFilePicker = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.csv";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setUploadFile(file);
          setUploadStatus("idle");
          setUploadError("");
          setUploadResult(null);

          try {
            if (file.name.endsWith(".csv")) {
              // CSV — simple line count
              const text = await file.text();
              const lines = text.split("\n").filter((l) => l.trim().length > 0);
              const count = Math.max(0, lines.length - 1);
              setUploadResult((prev) => ({ ...prev, total_patients: count }));
            } else {
              // XLSX — FileReader se binary string read karo
              const count = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const binary = ev.target.result;
                  // XLSX internally ZIP hai, sheet data mein <row entries count karo
                  const matches = binary.match(/<row /g);
                  resolve(matches ? Math.max(0, matches.length - 1) : null);
                };
                reader.onerror = () => resolve(null);
                reader.readAsBinaryString(file); // ✅ binary string, text() nahi
              });
              setUploadResult((prev) => ({ ...prev, total_patients: count }));
            }
          } catch (_) {
            // silent fail
          }
        }
      };
      input.click();
    }
  };

  // ─────────────────────────────────────────────
  // EXCEL UPLOAD API
  // ─────────────────────────────────────────────
  const handleExcelUpload = async () => {
    if (!uploadFile) {
      setUploadError("Please select an Excel file first.");
      return;
    }

    const docId = selectedDoctor?.doctor_id || selectedDoctor?.id;
    if (!docId) {
      setUploadError("No doctor selected.");
      return;
    }

    const formData = new FormData();
    formData.append("doctor_id", docId);
    formData.append("file", uploadFile);

    try {
      setUploadStatus("uploading");
      setUploadError("");

      const res = await fetch(`${API_URL}/hospitals/staff/import-patients`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      if (res.status === 202 || res.ok) {
        const data = JSON.parse(text);
        // Map API response → display stats
        // API returns: { status, import_kind, message, s3_key, manifest_key, staging_id, eta_hours }
        // For the stats cards we'll derive from file info or use defaults until backend sends row counts
        // setUploadResult({
        //   staging_id: data.staging_id,
        //   eta_hours: data.eta_hours ?? 24,
        //   message: data.message,
        //   // Row-level stats will be added when backend sends them
        //   total_patients: data.total_patients ?? null,
        //   successfully_added: data.successfully_added ?? null,
        //   error_count: data.error_count ?? 0,
        //   doctor_imported: data.doctor_imported ?? null,
        // });
        setUploadResult((prev) => ({
          total_patients: prev?.total_patients ?? null, // ✅ client-side count preserved
          staging_id: data.staging_id,
          eta_hours: data.eta_hours ?? 24,
          message: data.message,
          successfully_added: data.successfully_added ?? null,
          error_count: data.error_count ?? 0,
          doctor_imported: data.doctor_imported ?? null,
        }));
        setUploadStatus("success");
        setUploadFile(null);
      } else {
        let msg = `Upload failed (${res.status})`;
        try {
          const err = JSON.parse(text);
          msg = err.message || err.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }
    } catch (err) {
      setUploadStatus("error");
      setUploadError(err.message || "Upload failed. Please try again.");
    }
  };

  // ─────────────────────────────────────────────
  // ADD DOCTOR API
  // ─────────────────────────────────────────────
  const callAddDoctorAPI = async (snapshot) => {
    const token = Platform.OS === "web" ? localStorage.getItem("token") : null;

    let phone = snapshot.phoneNo.trim();
    if (phone && !phone.startsWith("+")) {
      phone = "+91" + phone.replace(/^0+/, "");
    }

    const body = {
      hospital_id: "HOSP_8FBF9714",
      phone,
      name: snapshot.fullName.trim(),
      specialization: snapshot.specialization.trim() || snapshot.department,
      experience: snapshot.experience.trim(),
      email: snapshot.email.trim(),
    };

    const res = await fetch(`${API_URL}/hospitals/staff/add-doctor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();

    if (!res.ok) {
      let friendlyMsg = `Server error (${res.status})`;
      try {
        const errJson = JSON.parse(responseText);
        friendlyMsg =
          errJson.message || errJson.error || errJson.detail || friendlyMsg;
      } catch (_) {
        if (responseText) friendlyMsg = responseText;
      }
      throw new Error(friendlyMsg);
    }

    try {
      return JSON.parse(responseText);
    } catch (_) {
      return {
        status: "created",
        doctor: {
          doctorname: snapshot.fullName,
          specialization: snapshot.specialization || snapshot.department,
        },
      };
    }
  };

  // ─────────────────────────────────────────────
  // ADD PATIENT API
  // ─────────────────────────────────────────────
  const callAddPatientAPI = async (doctorId, patientSnapshot) => {
    const token = Platform.OS === "web" ? localStorage.getItem("token") : null;

    let phone = patientSnapshot.phoneNo?.trim();
    if (phone && !phone.startsWith("+")) {
      phone = "+91" + phone.replace(/^0+/, "");
    }

    const body = {
      doctor_id: doctorId,
      phone,
      name: patientSnapshot.fullName.trim(),
      email: patientSnapshot.email?.trim() || "",
      age: Number(patientSnapshot.age),
      gender: patientSnapshot.gender,
    };

    const res = await fetch(`${API_URL}/hospitals/staff/add-patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = "Failed to add patient";
      try {
        const err = JSON.parse(text);
        msg = err.message || err.error || msg;
      } catch (_) {}
      throw new Error(msg);
    }

    return JSON.parse(text);
  };

  // ─────────────────────────────────────────────
  // FETCH DOCTOR LIST API
  // ─────────────────────────────────────────────
  const fetchDoctorList = async () => {
    const token = Platform.OS === "web" ? localStorage.getItem("token") : null;
    const hospitalId =
      Platform.OS === "web" ? localStorage.getItem("hospital_id") : null;

    setListLoading(true);
    setListError("");

    try {
      const res = await fetch(
        `${API_URL}/doctorsService/doctors?hospital_id=${hospitalId || "HOSP_8FBF9714"}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      const responseText = await res.text();

      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
          const errJson = JSON.parse(responseText);
          msg = errJson.message || errJson.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = JSON.parse(responseText);
      const list = Array.isArray(data) ? data : data.doctors || data.data || [];
      setDoctorList(list);
    } catch (err) {
      setListError(err.message || "Failed to load doctor list.");
    } finally {
      setListLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // VALIDATE
  // ─────────────────────────────────────────────
  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.department) return "Department is required.";
    if (!form.phoneNo.trim()) return "Phone number is required.";
    return "";
  };

  // ─────────────────────────────────────────────
  // SAVE DOCTOR
  // ─────────────────────────────────────────────
  const saveDoctor = async () => {
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return false;
    }

    const snapshot = { ...form };

    try {
      setIsSaving(true);
      setError("");

      const data = await callAddDoctorAPI(snapshot);
      const doctor = data.doctor || {};

      setSavedDoctors((prev) => [
        ...prev,
        {
          id: doctor.doctor_id || String(Date.now()),
          name: snapshot.fullName,
          department: snapshot.specialization.trim()
            ? snapshot.specialization
            : snapshot.department,
          status: data.status || "created",
        },
      ]);

      setLastSaved(true);
      setForm({ ...EMPTY_FORM });
      return true;
    } catch (err) {
      setError(err.message || "Failed to save doctor. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // SAVE PATIENT
  // ─────────────────────────────────────────────
  const savePatient = async () => {
    if (!patientForm.fullName?.trim()) {
      alert("Patient name is required");
      return false;
    }
    if (!patientForm.phoneNo?.trim()) {
      alert("Phone number is required");
      return false;
    }
    if (!patientForm.age?.trim()) {
      alert("Age is required");
      return false;
    }
    if (!patientForm.gender?.trim()) {
      alert("Gender is required");
      return false;
    }

    const docId = selectedDoctor?.doctor_id || selectedDoctor?.id;

    try {
      setIsSavingMobile(true);
      await callAddPatientAPI(docId, patientForm);

      setPatientSaved(true);
      setTimeout(() => setPatientSaved(false), 3000);

      setPatientCountMap((prev) => ({
        ...prev,
        [docId]: (prev[docId] || 0) + 1,
      }));

      setPatientForm({ ...EMPTY_PATIENT_FORM });
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setIsSavingMobile(false);
    }
  };

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleSaveDone = async () => {
    setIsSavingMobile(true);
    const success = await saveDoctor();
    setIsSavingMobile(false);
    if (success) {
      setLastSaved(true);
      setTimeout(() => setLastSaved(false), 4000);
    }
  };

  // const handlePatientSaveDone = async () => {
  //   try {
  //     setIsSavingMobile(true);
  //     setPatientSaved(true);
  //     setCurrentStep(2);
  //     setShowPatientForm(false);
  //     setShowDoctorList(true);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setIsSavingMobile(false);
  //   }
  // };
  const handlePatientSaveDone = async () => {
    try {
      setIsSavingMobile(true);

      // ✅ Pehle patient save karo
      const success = await savePatient();

      if (success) {
        setPatientSaved(true);
      }

      setCurrentStep(2);
      setShowPatientForm(false);
      setShowDoctorList(true);
      await fetchDoctorList(); // ✅ List refresh karo taaki count update ho
    } catch (e) {
      console.log(e);
    } finally {
      setIsSavingMobile(false);
    }
  };

  const handleSaveAndRegisterAnother = async () => {
    setIsSavingMobile(true);
    const success = await saveDoctor();
    setIsSavingMobile(false);
    if (success) {
      setLastSaved(true);
      setTimeout(() => setLastSaved(false), 4000);
    }
  };

  const handlePatientSaveAnother = async () => {
    const success = await savePatient();
    if (success) {
    }
    setPatientSaved(true);
    setTimeout(() => setPatientSaved(false), 5000);
  };

  const handleDoneGoToList = async () => {
    setLastSaved(false);
    setShowDoctorList(true);
    await fetchDoctorList();
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ─────────────────────────────────────────────
  // EXCEL UPLOAD SECTION — WEB
  // ─────────────────────────────────────────────
  const renderWebExcelSection = () => (
    <View style={styles.excelSection}>
      <Text style={styles.excelSectionTitle}>
        Adding many patients? Upload via Excel for faster entry
      </Text>

      <Text style={styles.excelUploadHeading}>Excel Upload</Text>

      {uploadStatus !== "success" ? (
        <>
          {/* Dashed Dropzone */}
          <TouchableOpacity
            style={styles.excelDropzone}
            onPress={openFilePicker}
            activeOpacity={0.8}
          >
            <Text style={styles.excelUploadIcon}>⬆</Text>
            <Text style={styles.excelDropText}>
              Upload patient list (.xlsx or .csv){" "}
              <Text style={styles.excelClickHere}>Click here</Text>
            </Text>
            {uploadFile && (
              <Text style={styles.excelFileName}>📄 {uploadFile.name}</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {uploadStatus === "error" && (
            <View style={styles.excelErrorBanner}>
              <Text style={styles.excelErrorText}>⚠️ {uploadError}</Text>
            </View>
          )}

          {/* Actions Row */}
          <View style={styles.excelActionsRow}>
            <TouchableOpacity
              style={[
                styles.excelUploadBtn,
                (!uploadFile || uploadStatus === "uploading") && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleExcelUpload}
              disabled={!uploadFile || uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.excelUploadBtnText}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.excelUploadBtnText}>Upload File</Text>
              )}
            </TouchableOpacity>

            <View style={styles.excelTemplateBox}>
              <TouchableOpacity style={styles.excelTemplateBtn}>
                <Text style={styles.excelTemplateBtnText}>
                  Download Template
                </Text>
              </TouchableOpacity>
              <Text style={styles.excelTemplateHint}>
                Not sure of format? Download our template first
              </Text>
            </View>
          </View>
        </>
      ) : (
        /* ── SUCCESS STATE ── */
        <>
          {/* Green Upload Done Box */}
          <View style={styles.excelSuccessBox}>
            <Text style={styles.excelSuccessCheckmark}>✓</Text>
            <Text style={styles.excelSuccessLabel}>Upload done</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.excelStatsRow}>
            <View style={[styles.excelStatCard, styles.excelStatCardNeutral]}>
              <Text style={styles.excelStatNumber}>
                {uploadResult?.total_patients ?? "—"}
              </Text>
              <Text style={[styles.excelStatLabel, { color: "#6B7280" }]}>
                Total Patient
              </Text>
            </View>
            <View style={[styles.excelStatCard, styles.excelStatCardSuccess]}>
              <Text style={[styles.excelStatNumber, { color: "#16A34A" }]}>
                {uploadResult?.successfully_added ?? "—"}
              </Text>
              <Text style={[styles.excelStatLabel, { color: "#16A34A" }]}>
                Successfully added
              </Text>
            </View>
            <View style={[styles.excelStatCard, styles.excelStatCardError]}>
              <Text style={[styles.excelStatNumber, { color: "#DC2626" }]}>
                {uploadResult?.error_count ?? 0}
              </Text>
              <Text style={[styles.excelStatLabel, { color: "#DC2626" }]}>
                Error detected
              </Text>
            </View>
          </View>

          {/* ETA note */}
          <Text style={styles.excelEtaNote}>
            📋 Staging ID: {uploadResult?.staging_id} · Data live within{" "}
            {uploadResult?.eta_hours ?? 24}h
          </Text>

          {/* Save & Done */}
          <TouchableOpacity
            style={styles.excelSaveDoneBtn}
            onPress={handlePatientSaveDone}
            activeOpacity={0.85}
          >
            <Text style={styles.excelSaveDoneBtnText}>Save & Done</Text>
          </TouchableOpacity>

          {/* Upload another */}
          <TouchableOpacity
            onPress={() => {
              setUploadStatus("idle");
              setUploadResult(null);
              setUploadError("");
            }}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.excelUploadAnother}>Upload another file</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // ─────────────────────────────────────────────
  // EXCEL UPLOAD SECTION — MOBILE
  // ─────────────────────────────────────────────
  const renderMobileExcelSection = () => (
    <View style={styles.mobileExcelSection}>
      <Text style={styles.mobileExcelTitle}>
        Adding many patients? Upload via Excel for faster entry
      </Text>

      <Text style={styles.excelUploadHeading}>Excel Upload</Text>

      {uploadStatus !== "success" ? (
        <>
          {/* Dropzone */}
          <TouchableOpacity
            style={styles.mobileExcelDropzone}
            onPress={openFilePicker}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 32, color: "#2563EB", marginBottom: 8 }}>
              ⬆
            </Text>
            <Text style={styles.mobileExcelDropText}>
              Upload patient list (.xlsx or .csv){" "}
              <Text style={styles.excelClickHere}>Click here</Text>
            </Text>
            {uploadFile && (
              <Text style={styles.excelFileName}>📄 {uploadFile.name}</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {uploadStatus === "error" && (
            <View style={styles.excelErrorBanner}>
              <Text style={styles.excelErrorText}>⚠️ {uploadError}</Text>
            </View>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.mobilePrimaryBtn,
              (!uploadFile || uploadStatus === "uploading") && { opacity: 0.5 },
            ]}
            onPress={handleExcelUpload}
            disabled={!uploadFile || uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.mobileBtnText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.mobileBtnText}>Upload Excel File</Text>
            )}
          </TouchableOpacity>

          {/* Template */}
          <TouchableOpacity style={styles.mobileTemplateBtn}>
            <Text style={styles.mobileTemplateBtnText}>Download Template</Text>
          </TouchableOpacity>
          <Text style={[styles.excelTemplateHint, { marginBottom: 8 }]}>
            Not sure of format? Download our template first
          </Text>
        </>
      ) : (
        /* ── MOBILE SUCCESS STATE ── */
        <>
          {/* Green Upload Done Box */}
          <View style={styles.mobileExcelSuccessBox}>
            <Text style={styles.excelSuccessCheckmark}>✓</Text>
            <Text style={styles.excelSuccessLabel}>Upload done</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.mobileExcelStatsRow}>
            <View
              style={[styles.mobileExcelStatCard, styles.excelStatCardNeutral]}
            >
              <Text style={styles.mobileExcelStatNumber}>
                {uploadResult?.doctor_imported ?? "—"}
              </Text>
              <Text style={[styles.mobileExcelStatLabel, { color: "#374151" }]}>
                Doctor{"\n"}Imported
              </Text>
            </View>
            <View
              style={[styles.mobileExcelStatCard, styles.excelStatCardSuccess]}
            >
              <Text
                style={[styles.mobileExcelStatNumber, { color: "#16A34A" }]}
              >
                {uploadResult?.total_patients ?? "—"}
              </Text>
              <Text style={[styles.mobileExcelStatLabel, { color: "#16A34A" }]}>
                patients{"\n"}records
              </Text>
            </View>
            <View
              style={[styles.mobileExcelStatCard, styles.excelStatCardError]}
            >
              <Text
                style={[styles.mobileExcelStatNumber, { color: "#DC2626" }]}
              >
                {uploadResult?.error_count ?? 0}
              </Text>
              <Text style={[styles.mobileExcelStatLabel, { color: "#DC2626" }]}>
                Error{"\n"}detected
              </Text>
            </View>
          </View>

          {/* ETA */}
          <Text
            style={[
              styles.excelEtaNote,
              { textAlign: "center", marginBottom: 16 },
            ]}
          >
            Data will be live within {uploadResult?.eta_hours ?? 24}h
          </Text>

          {/* Save & Done */}
          <TouchableOpacity
            style={styles.mobileSaveDoneBtn}
            onPress={handlePatientSaveDone}
            activeOpacity={0.85}
          >
            <Text style={styles.mobileBtnText}>Save & Done</Text>
          </TouchableOpacity>

          {/* Upload another */}
          <TouchableOpacity
            onPress={() => {
              setUploadStatus("idle");
              setUploadResult(null);
              setUploadError("");
            }}
            style={{ marginTop: 12, alignItems: "center" }}
          >
            <Text style={styles.excelUploadAnother}>Upload another file</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      {/* ═══════════════════════════════════════
          WEB VIEW  (width > 1000)
      ═══════════════════════════════════════ */}
      {Platform.OS === "web" && (width > 1000 || width === 0) && (
        <View style={styles.container}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={styles.main}>
              {/* Sidebar */}
              <View style={styles.left}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* Right Content */}
              <View style={styles.right}>
                <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>

                {/* Card */}
                <View style={styles.card}>
                  {/* Title Row */}
                  <View style={styles.titleTopSection}>
                    <Text style={styles.title}>AI Integration</Text>
                    <TouchableOpacity
                      style={styles.backHomeBtn}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={styles.backHomeBtnText}>Back to home</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Bar */}
                  <View style={styles.stepBar}>
                    {steps.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isActive = index === currentStep;
                      return (
                        <React.Fragment key={index}>
                          <View style={styles.stepItem}>
                            <View
                              style={[
                                styles.stepCircle,
                                isCompleted && styles.stepCircleComplete,
                                isActive && styles.stepCircleActive,
                                !isCompleted &&
                                  !isActive &&
                                  styles.stepCircleInactive,
                              ]}
                            >
                              {isCompleted ? (
                                <Text style={styles.stepCheckmark}>✓</Text>
                              ) : (
                                <Text
                                  style={[
                                    styles.stepNumber,
                                    !isActive && { color: "#9CA3AF" },
                                  ]}
                                >
                                  {index + 1}
                                </Text>
                              )}
                            </View>
                            <View style={styles.stepTextContainer}>
                              <Text
                                style={[
                                  styles.stepTitle,
                                  {
                                    color:
                                      index <= currentStep
                                        ? "#2563EB"
                                        : "#9CA3AF",
                                  },
                                ]}
                              >
                                {step.label}
                              </Text>
                              <Text style={styles.stepSubtitle}>
                                {step.sub}
                              </Text>
                            </View>
                          </View>
                          {index < steps.length - 1 && (
                            <View
                              style={[
                                styles.stepConnector,
                                {
                                  backgroundColor:
                                    index < currentStep ? "#2563EB" : "#E5E7EB",
                                },
                              ]}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* ── PATIENT FORM ── */}
                  {showPatientForm ? (
                    <ScrollView
                      style={styles.scrollBody}
                      contentContainerStyle={styles.bodyContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {patientSaved && (
                        <View style={styles.successBanner}>
                          <View style={styles.successIconCircle}>
                            <Text style={styles.successIconCheck}>✓</Text>
                          </View>
                          <Text style={styles.successText}>
                            Patient added successfully
                          </Text>
                        </View>
                      )}

                      <View style={styles.infoBanner}>
                        <Text style={styles.infoBannerText}>
                          For doctor, you can add their associated patients.
                          Click skip for now to add patients later.
                        </Text>
                      </View>

                      <View style={styles.listHeader}>
                        <Text style={styles.sectionLabel}>
                          Patients associate with Dr.{" "}
                          {selectedDoctor?.doctorname || selectedDoctor?.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.backHomeBtn}
                          onPress={() => setShowPatientForm(false)}
                        >
                          <Text style={styles.backHomeBtnText}>
                            Skip for now
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.formSection}>
                        <Text style={styles.sectionLabel}>
                          Patients Details :
                        </Text>

                        {/* Row 1 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Full name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Enter Name..."
                              value={patientForm.fullName}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, fullName: v }))
                              }
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Age <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="age"
                              value={patientForm.age}
                              placeholderTextColor="#C0C0C0"
                              keyboardType="numeric"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, age: v }))
                              }
                            />
                          </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Patient ID</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Auto-generated"
                              editable={false}
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Gender <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Select Gender"
                              value={patientForm.gender}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, gender: v }))
                              }
                            />
                          </View>
                        </View>

                        {/* Row 3 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Phone no</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="+91XXXXXXXXXX"
                              value={patientForm.phoneNo}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, phoneNo: v }))
                              }
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Insurance policy number
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="eg SH-48821-C"
                              value={patientForm.policyNo}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, policyNo: v }))
                              }
                            />
                          </View>
                        </View>

                        {/* Row 4 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Insurer</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Select Insurer"
                              value={patientForm.insurer}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({ ...p, insurer: v }))
                              }
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Admission date
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="dd-mm-yyyy"
                              value={patientForm.admissionDate}
                              placeholderTextColor="#C0C0C0"
                              onChangeText={(v) =>
                                setPatientForm((p) => ({
                                  ...p,
                                  admissionDate: v,
                                }))
                              }
                            />
                          </View>
                        </View>

                        {/* Diagnosis */}
                        <View style={{ marginBottom: 20 }}>
                          <Text style={styles.fieldLabel}>
                            Diagnosis/Procedure
                          </Text>
                          <TextInput
                            style={styles.input}
                            placeholder="eg CABG , Hysterectomy"
                            value={patientForm.diagnosis}
                            placeholderTextColor="#C0C0C0"
                            onChangeText={(v) =>
                              setPatientForm((p) => ({ ...p, diagnosis: v }))
                            }
                          />
                        </View>

                        {/* Buttons */}
                        <View style={styles.btnRow}>
                          <TouchableOpacity
                            style={[
                              styles.saveDoneBtn,
                              isSavingMobile && { opacity: 0.7 },
                            ]}
                            onPress={handlePatientSaveDone}
                            disabled={isSavingMobile}
                            activeOpacity={0.85}
                          >
                            {isSavingMobile ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.saveDoneBtnText}>
                                  Saving...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.saveDoneBtnText}>
                                Save & Done
                              </Text>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.saveAnotherBtn,
                              isSavingMobile && { opacity: 0.7 },
                            ]}
                            onPress={handlePatientSaveAnother}
                            disabled={isSavingMobile}
                            activeOpacity={0.85}
                          >
                            {isSavingMobile ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.saveAnotherBtnText}>
                                  Saving...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.saveAnotherBtnText}>
                                Save & Register Another →
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* ── EXCEL UPLOAD (WEB) ── */}
                        {renderWebExcelSection()}
                      </View>
                    </ScrollView>
                  ) : showDoctorList ? (
                    /* ── DOCTOR LIST ── */
                    <View style={styles.listContainer}>
                      <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>
                          Total Doctor Saved List
                        </Text>
                        <TouchableOpacity
                          style={styles.addDoctorBtn}
                          onPress={() => {
                            setShowDoctorList(false);
                            setLastSaved(false);
                            setForm({ ...EMPTY_FORM });
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.addDoctorBtnText}>
                            + Add Doctor
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {listLoading ? (
                        <View style={styles.listCenterBox}>
                          <ActivityIndicator color="#2563EB" size="large" />
                          <Text style={styles.listLoadingText}>
                            Loading doctors...
                          </Text>
                        </View>
                      ) : listError ? (
                        <View style={styles.listCenterBox}>
                          <Text style={styles.listErrorText}>
                            ⚠️ {listError}
                          </Text>
                          <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={fetchDoctorList}
                          >
                            <Text style={styles.retryBtnText}>Retry</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <ScrollView
                          style={{ flex: 1 }}
                          showsVerticalScrollIndicator={false}
                        >
                          <View style={styles.tableHead}>
                            <Text style={[styles.tableHeadCell, styles.colId]}>
                              ID
                            </Text>
                            <Text
                              style={[styles.tableHeadCell, styles.colName]}
                            >
                              DOCTOR NAME
                            </Text>
                            <Text
                              style={[styles.tableHeadCell, styles.colName]}
                            >
                              PATIENT COUNT
                            </Text>
                            <Text
                              style={[styles.tableHeadCell, styles.colDept]}
                            >
                              DEPARTMENT
                            </Text>
                            <Text
                              style={[styles.tableHeadCell, styles.colAction]}
                            >
                              ACTION
                            </Text>
                            <Text
                              style={[styles.tableHeadCell, styles.colAction2]}
                            >
                              ACTION
                            </Text>
                          </View>
                          {doctorList.length === 0 ? (
                            <View style={styles.listCenterBox}>
                              <Text style={styles.listEmptyText}>
                                No doctors found.
                              </Text>
                            </View>
                          ) : (
                            doctorList.map((doc, index) => (
                              <View
                                key={doc.doctor_id || doc.id || index}
                                style={[
                                  styles.tableRow,
                                  index % 2 === 0 && styles.tableRowEven,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.tableCell,
                                    styles.colId,
                                    styles.cellId,
                                  ]}
                                >
                                  #{index + 1}
                                </Text>
                                <Text
                                  style={[styles.tableCell, styles.colName]}
                                >
                                  {doc.doctorname || doc.name || "—"}
                                </Text>
                                <Text
                                  style={[styles.tableCell, styles.colName]}
                                >
                                  {patientCountMap[doc.doctor_id || doc.id] ||
                                    0}
                                </Text>
                                <Text
                                  style={[styles.tableCell, styles.colDept]}
                                >
                                  {doc.specialization || doc.department || "—"}
                                </Text>
                                <View style={styles.colAction}>
                                  <TouchableOpacity
                                    style={styles.addPatientBtn}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                      setLastSaved(false);
                                      setSelectedDoctor(doc);
                                      setUploadStatus("idle");
                                      setUploadResult(null);
                                      setUploadFile(null);
                                      setShowPatientForm(true);
                                    }}
                                  >
                                    <Text style={styles.addPatientBtnText}>
                                      + Add Patient
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <Text
                                  style={[
                                    styles.tableCell,
                                    styles.colAction2,
                                    { color: "#9CA3AF" },
                                  ]}
                                >
                                  —
                                </Text>
                              </View>
                            ))
                          )}
                        </ScrollView>
                      )}
                    </View>
                  ) : (
                    /* ── DOCTOR FORM ── */
                    <ScrollView
                      style={styles.scrollBody}
                      contentContainerStyle={styles.bodyContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {lastSaved && (
                        <View style={styles.successBanner}>
                          <View style={styles.successIconCircle}>
                            <Text style={styles.successIconCheck}>✓</Text>
                          </View>
                          <Text style={styles.successText}>
                            Doctor added successfully
                          </Text>
                        </View>
                      )}

                      <View style={styles.infoBanner}>
                        <Text style={styles.infoBannerText}>
                          Add doctor one at a time. For each doctor, you can add
                          their associated patients. Click Save & continue to
                          keep adding.
                        </Text>
                      </View>

                      <View style={styles.formSection}>
                        <Text style={styles.sectionLabel}>
                          Doctor Details :
                        </Text>

                        {!!error && (
                          <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                          </View>
                        )}

                        {/* Row 1 */}
                        <View style={[styles.formRow, { zIndex: 20 }]}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Full name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Enter Name..."
                              placeholderTextColor="#C0C0C0"
                              value={form.fullName}
                              onChangeText={(v) => handleChange("fullName", v)}
                            />
                          </View>
                          <View style={[styles.formField, { zIndex: 20 }]}>
                            <Text style={styles.fieldLabel}>
                              Department <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={{ position: "relative", zIndex: 20 }}>
                              <TouchableOpacity
                                style={[styles.input, styles.dropdownTrigger]}
                                onPress={() => setDropdownOpen((prev) => !prev)}
                                activeOpacity={0.8}
                              >
                                <Text
                                  style={
                                    form.department
                                      ? styles.dropdownSelected
                                      : styles.dropdownPlaceholder
                                  }
                                >
                                  {form.department || "Select department"}
                                </Text>
                                <Text style={styles.dropdownArrow}>
                                  {dropdownOpen ? "▲" : "▼"}
                                </Text>
                              </TouchableOpacity>
                              {dropdownOpen && (
                                <View style={styles.dropdownList}>
                                  <ScrollView
                                    style={{ maxHeight: 200 }}
                                    nestedScrollEnabled
                                  >
                                    {departments.map((dept) => (
                                      <TouchableOpacity
                                        key={dept}
                                        style={[
                                          styles.dropdownItem,
                                          form.department === dept &&
                                            styles.dropdownItemActive,
                                        ]}
                                        onPress={() => {
                                          handleChange("department", dept);
                                          setDropdownOpen(false);
                                        }}
                                      >
                                        <Text
                                          style={[
                                            styles.dropdownItemText,
                                            form.department === dept &&
                                              styles.dropdownItemTextActive,
                                          ]}
                                        >
                                          {dept}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Experience</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g. 5 years"
                              placeholderTextColor="#C0C0C0"
                              value={form.experience}
                              onChangeText={(v) =>
                                handleChange("experience", v)
                              }
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Specialization
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g Interventional Cardiology"
                              placeholderTextColor="#C0C0C0"
                              value={form.specialisation}
                              onChangeText={(v) =>
                                handleChange("specialization", v)
                              }
                            />
                          </View>
                        </View>

                        {/* Row 3 */}
                        <View style={styles.formRow}>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>
                              Phone no <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                              style={styles.input}
                              placeholder="+91XXXXXXXXXX"
                              placeholderTextColor="#C0C0C0"
                              value={form.phoneNo}
                              onChangeText={(v) => handleChange("phoneNo", v)}
                              keyboardType="phone-pad"
                            />
                          </View>
                          <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Email</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="doctor@hospital.com"
                              placeholderTextColor="#C0C0C0"
                              value={form.email}
                              onChangeText={(v) => handleChange("email", v)}
                              keyboardType="email-address"
                            />
                          </View>
                        </View>

                        <View style={styles.btnRow}>
                          <TouchableOpacity
                            style={[
                              styles.saveDoneBtn,
                              isSaving && styles.btnDisabled,
                            ]}
                            onPress={handleSaveDone}
                            disabled={isSaving}
                            activeOpacity={0.85}
                          >
                            {isSaving ? (
                              <View style={styles.btnInner}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.saveDoneBtnText}>
                                  Saving...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.saveDoneBtnText}>
                                Save & Done
                              </Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.saveAnotherBtn,
                              isSaving && styles.btnDisabled,
                            ]}
                            onPress={handleSaveAndRegisterAnother}
                            disabled={isSaving}
                            activeOpacity={0.85}
                          >
                            {isSaving ? (
                              <View style={styles.btnInner}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={styles.saveAnotherBtnText}>
                                  Saving...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.saveAnotherBtnText}>
                                Save & Register Another Doctor →
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.doneBtn}
                          onPress={handleDoneGoToList}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.doneBtnText}>
                            Done & go to doctor list
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {savedDoctors.length > 0 && (
                        <View style={styles.savedSection}>
                          <Text style={styles.savedSectionLabel}>
                            Doctor being Saved
                          </Text>
                          {savedDoctors.map((doc) => (
                            <View key={doc.id} style={styles.doctorCard}>
                              <View style={styles.doctorAvatar}>
                                <Text style={styles.doctorAvatarText}>
                                  {getInitials(doc.name)}
                                </Text>
                              </View>
                              <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>
                                  {doc.name}
                                </Text>
                                <Text style={styles.doctorDept}>
                                  {doc.department}
                                </Text>
                              </View>
                              {doc.status === "linked" && (
                                <View style={styles.linkedBadge}>
                                  <Text style={styles.linkedBadgeText}>
                                    Linked
                                  </Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {savedDoctors.length > 0 && (
                        <TouchableOpacity
                          style={styles.doneBtn}
                          onPress={handleDoneGoToList}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.doneBtnText}>
                            Done & go to doctor list
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ═══════════════════════════════════════
          MOBILE VIEW  (width < 1000)
      ═══════════════════════════════════════ */}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={styles.mobileStepBar}>
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <View key={index} style={styles.mobileStepItem}>
                  <View
                    style={[
                      styles.mobileStepCircle,
                      isCompleted && { backgroundColor: "#2563EB" },
                      isActive && { backgroundColor: "#2563EB" },
                      !isCompleted && !isActive && styles.mobileStepInactive,
                    ]}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      {isCompleted ? "✓" : index + 1}
                    </Text>
                  </View>
                  <Text style={styles.mobileStepText}>{step.label}</Text>
                </View>
              );
            })}
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {lastSaved && !showDoctorList && !showPatientForm && (
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View style={styles.successIconCircle}>
                  <Text style={styles.successIconCheck}>✓</Text>
                </View>
                <Text style={styles.successText}>
                  Doctor added successfully
                </Text>
              </View>
            )}

            {/* ── MOBILE PATIENT FORM ── */}
            {showPatientForm ? (
              <>
                {patientSaved && (
                  <View style={styles.successBanner}>
                    <View style={styles.successIconCircle}>
                      <Text style={styles.successIconCheck}>✓</Text>
                    </View>
                    <Text style={styles.successText}>
                      Patient added successfully
                    </Text>
                  </View>
                )}

                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerText}>
                    For doctor, you can add their associated patients.
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text style={styles.sectionLabel}>
                    Patients for Dr.{" "}
                    {selectedDoctor?.doctorname || selectedDoctor?.name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPatientForm(false)}>
                    <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                      Skip
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>Patient Details</Text>

                <TextInput
                  style={styles.mobileInput}
                  placeholder="Full Name"
                  value={patientForm.fullName}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, fullName: v }))
                  }
                />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Age"
                  value={patientForm.age}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, age: v }))
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Gender"
                  value={patientForm.gender}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, gender: v }))
                  }
                />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Phone Number"
                  value={patientForm.phoneNo}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, phoneNo: v }))
                  }
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Policy Number (optional)"
                  value={patientForm.policyNo}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, policyNo: v }))
                  }
                />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Insurer (optional)"
                  value={patientForm.insurer}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, insurer: v }))
                  }
                />

                <TouchableOpacity
                  style={styles.mobileInput}
                  onPress={() => {
                    setCalendarField("admission");
                    setCalendarVisible(true);
                  }}
                >
                  <Text
                    style={
                      patientForm.admissionDate
                        ? styles.dropdownSelected
                        : styles.dropdownPlaceholder
                    }
                  >
                    {patientForm.admissionDate || "Select Admission Date"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.mobileInput}
                  placeholder="Diagnosis / Procedure (optional)"
                  value={patientForm.diagnosis}
                  placeholderTextColor="#a3a2a2ff"
                  onChangeText={(v) =>
                    setPatientForm((p) => ({ ...p, diagnosis: v }))
                  }
                />

                <TouchableOpacity
                  style={styles.mobilePrimaryBtn}
                  onPress={handlePatientSaveDone}
                  disabled={isSavingMobile}
                >
                  {isSavingMobile ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.mobileBtnText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.mobileBtnText}>Save & Done</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileSecondaryBtn}
                  onPress={handlePatientSaveAnother}
                  disabled={isSavingMobile}
                >
                  {isSavingMobile ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.mobileBtnText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.mobileBtnText}>Save & Add Another</Text>
                  )}
                </TouchableOpacity>

                {/* ── EXCEL UPLOAD (MOBILE) ── */}
                {renderMobileExcelSection()}
              </>
            ) : !showDoctorList ? (
              /* ── MOBILE DOCTOR FORM ── */
              <>
                <Text style={styles.sectionLabel}>Doctor Details</Text>

                <View style={[styles.mobileFormRow, { zIndex: 20 }]}>
                  <View style={styles.mobileFormField}>
                    <Text style={styles.fieldLabel}>
                      Full name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="Enter Name..."
                      placeholderTextColor="#C0C0C0"
                      value={form.fullName}
                      onChangeText={(v) => handleChange("fullName", v)}
                    />
                  </View>
                  <View style={[styles.mobileFormField, { zIndex: 20 }]}>
                    <Text style={styles.fieldLabel}>
                      Department <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={{ position: "relative", zIndex: 20 }}>
                      <TouchableOpacity
                        style={[styles.mobileInput, styles.dropdownTrigger]}
                        onPress={() => setDropdownOpen((prev) => !prev)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={
                            form.department
                              ? styles.dropdownSelected
                              : styles.dropdownPlaceholder
                          }
                        >
                          {form.department || "Select department"}
                        </Text>
                        <Text style={styles.dropdownArrow}>
                          {dropdownOpen ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>
                      {dropdownOpen && (
                        <View style={styles.dropdownList}>
                          <ScrollView
                            style={{ maxHeight: 200 }}
                            nestedScrollEnabled
                          >
                            {departments.map((dept) => (
                              <TouchableOpacity
                                key={dept}
                                style={[
                                  styles.dropdownItem,
                                  form.department === dept &&
                                    styles.dropdownItemActive,
                                ]}
                                onPress={() => {
                                  handleChange("department", dept);
                                  setDropdownOpen(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    form.department === dept &&
                                      styles.dropdownItemTextActive,
                                  ]}
                                >
                                  {dept}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.mobileFormRow}>
                  <View style={styles.mobileFormField}>
                    <Text style={styles.fieldLabel}>Experience</Text>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="e.g. 5 years"
                      placeholderTextColor="#C0C0C0"
                      value={form.experience}
                      onChangeText={(v) => handleChange("experience", v)}
                    />
                  </View>
                  <View style={styles.mobileFormField}>
                    <Text style={styles.fieldLabel}>Specialization</Text>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="e.g Interventional Cardiology"
                      placeholderTextColor="#C0C0C0"
                      value={form.specialization}
                      onChangeText={(v) => handleChange("specialization", v)}
                    />
                  </View>
                </View>

                <View style={styles.mobileFormRow}>
                  <View style={styles.mobileFormField}>
                    <Text style={styles.fieldLabel}>
                      Phone no <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="+91XXXXXXXXXX"
                      placeholderTextColor="#C0C0C0"
                      value={form.phoneNo}
                      onChangeText={(v) => handleChange("phoneNo", v)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.mobileFormField}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="doctor@hospital.com"
                      placeholderTextColor="#C0C0C0"
                      value={form.email}
                      onChangeText={(v) => handleChange("email", v)}
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.mobilePrimaryBtn}
                  onPress={handleSaveDone}
                  disabled={isSavingMobile}
                >
                  {isSavingMobile ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.mobileBtnText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.mobileBtnText}>Save & Done</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileSecondaryBtn}
                  onPress={handleSaveAndRegisterAnother}
                  disabled={isSavingMobile}
                >
                  {isSavingMobile ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.mobileBtnText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.mobileBtnText}>Save & Add Another</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobilePrimaryBtn}
                  onPress={handleDoneGoToList}
                >
                  <Text style={styles.mobileBtnText}>Go to Doctor List</Text>
                </TouchableOpacity>

                {savedDoctors.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    {savedDoctors.map((doc) => (
                      <View key={doc.id} style={styles.mobileDoctorCard}>
                        <View style={styles.doctorAvatar}>
                          <Text style={styles.doctorAvatarText}>
                            {getInitials(doc.name)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={{ fontWeight: "600" }}>{doc.name}</Text>
                          <Text style={{ color: "#6B7280" }}>
                            {doc.department}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {savedDoctors.length > 0 && (
                  <TouchableOpacity
                    style={styles.mobilePrimaryBtn}
                    onPress={handleDoneGoToList}
                  >
                    <Text style={styles.mobileBtnText}>Go to Doctor List</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              /* ── MOBILE DOCTOR LIST ── */
              <>
                <Text style={styles.sectionLabel}>Doctor List</Text>
                {doctorList.map((doc, i) => (
                  <View key={i} style={styles.doctorCardMobileNew}>
                    <Text style={styles.srNo}># Id : {i + 1}</Text>
                    <View style={styles.rowBetween}>
                      <Text style={styles.label}>Doctor Name</Text>
                      <Text style={styles.value}>
                        {doc.doctorname || doc.name}
                      </Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.label}>Department</Text>
                      <Text style={styles.value}>
                        {doc.specialization || doc.department || "—"}
                      </Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.label}>Patients No</Text>
                      <Text style={styles.value}>
                        {patientCountMap[doc.doctor_id || doc.id] || 0}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addPatientBtnMobileNew}
                      onPress={() => {
                        setLastSaved(false);
                        setSelectedDoctor(doc);
                        setUploadStatus("idle");
                        setUploadResult(null);
                        setUploadFile(null);
                        setShowPatientForm(true);
                      }}
                    >
                      <Text style={styles.addPatientText}>+ Add Patient</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{ backgroundColor: "#fff", borderRadius: 12, padding: 10 }}
          >
            <Calendar
              onDayPress={(day) => {
                const formatted = formatDate(day.dateString);
                if (calendarField === "dob") {
                  setPatientForm((p) => ({ ...p, dob: formatted }));
                } else if (calendarField === "admission") {
                  setPatientForm((p) => ({ ...p, admissionDate: formatted }));
                }
                setCalendarVisible(false);
              }}
              theme={{
                todayTextColor: "#2563EB",
                arrowColor: "#2563EB",
                selectedDayBackgroundColor: "#2563EB",
              }}
            />
            <TouchableOpacity
              onPress={() => setCalendarVisible(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={{ color: "#2563EB", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
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
  header: { marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  titleTopSection: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexShrink: 0,
  },
  title: { fontSize: 19, fontWeight: "700", color: "#111827" },
  backHomeBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  backHomeBtnText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    justifyContent: "space-around",
    flexShrink: 0,
  },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleComplete: { backgroundColor: "#2563EB" },
  stepCircleActive: { backgroundColor: "#2563EB" },
  stepCircleInactive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  stepCheckmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepNumber: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepTextContainer: { flexDirection: "column" },
  stepTitle: { fontSize: 12, fontWeight: "700" },
  stepSubtitle: { fontSize: 10, color: "#9CA3AF", marginTop: 1 },
  stepConnector: {
    height: 2,
    width: 32,
    marginHorizontal: 8,
    flexShrink: 0,
    alignSelf: "center",
  },
  scrollBody: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e3e3e3",
    borderRadius: 5,
    margin: "3%",
  },
  bodyContent: { paddingVertical: 28, paddingHorizontal: 32 },
  successBanner: { alignItems: "center", marginBottom: 20 },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  successIconCheck: { color: "#22C55E", fontSize: 24, fontWeight: "700" },
  successText: { fontSize: 16, fontWeight: "700", color: "#22C55E" },
  infoBanner: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoBannerText: { fontSize: 13, color: "#1D4ED8", lineHeight: 20 },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { fontSize: 13, color: "#DC2626" },
  formSection: { width: "100%" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  formRow: { flexDirection: "row", gap: 20, marginBottom: 18 },
  formField: { flex: 1 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  required: { color: "#EF4444" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#fff",
    outlineStyle: "none",
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownPlaceholder: { fontSize: 13, color: "#C0C0C0", flex: 1 },
  dropdownSelected: { fontSize: 13, color: "#111827", flex: 1 },
  dropdownArrow: { fontSize: 10, color: "#9CA3AF" },
  dropdownList: {
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 999,
    elevation: 10,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItemActive: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 13, color: "#374151" },
  dropdownItemTextActive: { color: "#2563EB", fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 15, marginTop: 8 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnDisabled: { opacity: 0.6 },
  saveDoneBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  saveDoneBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  saveAnotherBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  saveAnotherBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  savedSection: { marginTop: 28, width: "100%" },
  savedSectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 12,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  doctorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  doctorAvatarText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  doctorDept: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  linkedBadge: {
    backgroundColor: "#FEF9C3",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  linkedBadgeText: { fontSize: 11, fontWeight: "600", color: "#CA8A04" },
  doneBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  doneBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    display: "flex",
    flexDirection: "column",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  listHeaderTitle: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  addDoctorBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addDoctorBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableRowEven: { backgroundColor: "#FAFAFA" },
  tableCell: { fontSize: 13, color: "#374151" },
  colId: { width: 50 },
  colName: { flex: 1 },
  colDept: { width: 160 },
  colAction: { width: 160, alignItems: "flex-start", justifyContent: "center" },
  colAction2: { width: 80, textAlign: "center" },
  cellId: { color: "#2563EB", fontWeight: "600" },
  addPatientBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 7,
  },
  addPatientBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  listCenterBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  listLoadingText: { fontSize: 14, color: "#9CA3AF", marginTop: 10 },
  listErrorText: { fontSize: 13, color: "#DC2626", textAlign: "center" },
  listEmptyText: { fontSize: 14, color: "#9CA3AF" },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 7,
  },
  retryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // ── Excel Upload Shared ──
  excelUploadHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 14,
  },
  excelDropzone: {
    borderWidth: 1.5,
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
    cursor: "pointer",
  },
  excelUploadIcon: { fontSize: 32, color: "#2563EB", marginBottom: 8 },
  excelDropText: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  excelClickHere: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  excelFileName: {
    marginTop: 10,
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  excelActionsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginTop: 4,
  },
  excelUploadBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  excelUploadBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  excelTemplateBox: { flex: 1 },
  excelTemplateBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 6,
  },
  excelTemplateBtnText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  excelTemplateHint: { fontSize: 11, color: "#9CA3AF", fontStyle: "italic" },
  excelErrorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  excelErrorText: { fontSize: 13, color: "#DC2626" },

  // ── Excel Success — Web ──
  excelSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  excelSectionTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
    fontStyle: "italic",
  },
  excelSuccessBox: {
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 16,
  },
  excelSuccessCheckmark: {
    fontSize: 28,
    color: "#16A34A",
    fontWeight: "700",
    marginBottom: 6,
  },
  excelSuccessLabel: { fontSize: 16, fontWeight: "700", color: "#16A34A" },
  excelStatsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  excelStatCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  excelStatCardNeutral: { borderColor: "#E5E7EB", backgroundColor: "#fff" },
  excelStatCardSuccess: { borderColor: "#86EFAC", backgroundColor: "#F0FDF4" },
  excelStatCardError: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  excelStatNumber: { fontSize: 28, fontWeight: "700", color: "#374151" },
  excelStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  excelEtaNote: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 20,
  },
  excelSaveDoneBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  excelSaveDoneBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  excelUploadAnother: { color: "#2563EB", fontWeight: "600", fontSize: 13 },

  // ── Mobile Styling ──
  mobileStepBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  mobileStepItem: { alignItems: "center" },
  mobileStepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  mobileStepInactive: { backgroundColor: "#E5E7EB" },
  mobileStepText: { fontSize: 10, textAlign: "center" },
  mobileFormRow: { flexDirection: "column", gap: 5, marginBottom: 14 },
  mobileFormField: { flex: 1 },
  mobileInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  mobilePrimaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  mobileSecondaryBtn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  mobileBtnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  mobileDoctorCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
  },
  doctorCardMobileNew: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  srNo: { fontSize: 13, color: "#6B7280", marginBottom: 10, fontWeight: "500" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  addPatientBtnMobileNew: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addPatientText: { color: "#fff", fontWeight: "600" },

  // ── Mobile Excel Section ──
  mobileExcelSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  mobileExcelTitle: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 8,
  },
  mobileExcelDropzone: {
    borderWidth: 1.5,
    borderColor: "#93C5FD",
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  mobileExcelDropText: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  mobileTemplateBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  mobileTemplateBtnText: { fontSize: 13, fontWeight: "500", color: "#374151" },

  // ── Mobile Excel Success ──
  mobileExcelSuccessBox: {
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    paddingVertical: 36,
    alignItems: "center",
    marginBottom: 16,
  },
  mobileExcelStatsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  mobileExcelStatCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  mobileExcelStatNumber: { fontSize: 22, fontWeight: "700", color: "#374151" },
  mobileExcelStatLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 15,
  },
  mobileSaveDoneBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    marginTop: 4,
  },
});

export default ManualDataIntegration;
