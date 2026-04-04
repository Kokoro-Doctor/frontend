import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Image,
  Animated,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

export default function HospitalInsuranceDownload({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();

  const handleDownload = () => {
    Alert.alert("Download", "Downloading updated claim file...", [
      { text: "OK" },
    ]);
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={stylesWeb.root}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={stylesWeb.background}
            resizeMode="cover"
          >
            <View style={stylesWeb.overlay} />

            <View style={stylesWeb.mainRow}>
              {/* LEFT SIDEBAR */}
              <View style={stylesWeb.sidebar}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* RIGHT CONTENT */}
              <View style={stylesWeb.content}>
                <View style={stylesWeb.headerRow}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>

                {/* WHITE CARD */}
                <View style={stylesWeb.card}>
                  {/* ── CARD TITLE + BACK ── */}
                  <View style={stylesWeb.cardTitleRow}>
                    <Text style={stylesWeb.cardTitle}>Post Op Care</Text>
                    <TouchableOpacity
                      style={stylesWeb.backToHomeBtn}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={stylesWeb.backToHomeBtnText}>
                        Back to home
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* ── STEP BAR ── */}
                  <View style={stylesWeb.stepBar}>
                    {[
                      {
                        label: "Upload Documents",
                        sub: "Upload document",
                        done: true,
                      },
                      {
                        label: "Full Case Analysis",
                        sub: "Analyze Reports",
                        done: true,
                      },
                      {
                        label: "Download Updated File",
                        sub: "Editable & ready",
                        done: false,
                        active: true,
                      },
                    ].map((step, i, arr) => (
                      <React.Fragment key={i}>
                        <View style={stylesWeb.stepItem}>
                          {/* Circle */}
                          {step.done ? (
                            <View style={stylesWeb.stepCircleDone}>
                              <Text style={stylesWeb.stepTick}>✓</Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                stylesWeb.stepCircleInactive,
                                step.active && stylesWeb.stepCircleActive,
                              ]}
                            >
                              <Text
                                style={[
                                  stylesWeb.stepNum,
                                  step.active && stylesWeb.stepNumActive,
                                ]}
                              >
                                {i + 1}
                              </Text>
                            </View>
                          )}
                          <View style={{ marginLeft: 8 }}>
                            <Text
                              style={[
                                stylesWeb.stepLabel,
                                (step.done || step.active) &&
                                  stylesWeb.stepLabelActive,
                              ]}
                            >
                              {step.label}
                            </Text>
                            <Text style={stylesWeb.stepSub}>{step.sub}</Text>
                          </View>
                        </View>
                        {i < arr.length - 1 && (
                          <View style={stylesWeb.stepConnector} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  <View style={{ flex: 1 }}>
                    {/* INFO BOX */}
                    <View
                      style={{
                        backgroundColor: "#E8F0FE",
                        borderColor: "#90CAF9",
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#1E3A8A" }}>
                        Updated claim file generated. 5 of 6 suggestions
                        applied. Review below, make any final edits, then
                        download.
                      </Text>
                    </View>

                    {/* CLAIM CARD */}
                    <View
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        paddingBottom: 12,
                        height: 350,
                      }}
                    >
                      <View style={stylesMobile.fileHeader}>
                        <Ionicons
                          name="document-text"
                          size={18}
                          color="#1976D2"
                        />
                        {/* FILE NAME */}
                        <Text style={stylesMobile.fileName}>
                          {analysisData?.structured_data?.source_filename ||
                            "Insurance_Claim_Sharma_Aug2024.pdf"}
                        </Text>
                      </View>

                      <ScrollView>
                        <View style={stylesWeb.formHeaderContainer}>
                          {/* TOP ROW */}
                          <View style={stylesWeb.formTopRow}>
                            {/* LEFT LOGO */}
                            <View style={stylesWeb.logoRow}>
                              <Image
                                source={require("../../assets/HospitalPortal/Icon/mediassit.png")}
                                style={stylesWeb.logo}
                                resizeMode="contain"
                              />
                              <Text style={stylesWeb.logoText}>
                                Medi Assist
                              </Text>
                            </View>

                            {/* CENTER TITLE */}
                            <View style={stylesWeb.centerTitleBlock}>
                              <Text style={stylesWeb.formMainTitle}>
                                REIMBURSEMENT CLAIM FORM
                              </Text>
                              <Text style={stylesWeb.formSubTitle}>
                                TO BE FILLED BY THE INSURED
                              </Text>
                              <Text style={stylesWeb.formNoteCenter}>
                                The issue of this Form is not to be taken as an
                                admission of liability
                              </Text>
                            </View>

                            {/* RIGHT TEXT */}
                            <Text style={stylesWeb.formNoteRight}>
                              (To be Filled in block letters)
                            </Text>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER WITH CENTER TEXT */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF PRIMARY INSURED:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          {/* MAIN CONTENT + RIGHT SECTION BAR */}
                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT FORM */}
                            <View style={{ flex: 1 }}>
                              {/* ROW 1: POLICY + SL NO */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    a) Policy No.:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    b) Sl. No./Certificate no.
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 14 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 2 */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  c) Company / TPA ID (MA ID)No:
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 22 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                      maxLength={1}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* ROW 3 */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>d) Name:</Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                      maxLength={1}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* ROW 4 */}
                              <View style={stylesWeb.addressRow}>
                                {/* LABEL aligned with first row */}
                                <Text style={stylesWeb.label}>e) Address:</Text>

                                {/* BOXES */}
                                <View style={stylesWeb.addressBoxes}>
                                  {/* FIRST ROW */}
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 40 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>

                                  {/* SECOND ROW */}
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 35 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* CITY + STATE */}
                              <View style={stylesWeb.rowBetweens}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>City:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>State:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* PIN + PHONE + EMAIL */}
                              <View style={stylesWeb.rowBetweensLast}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Pin Code:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Phone No:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Email ID:</Text>
                                  <TextInput style={stylesWeb.longInput} />
                                </View>
                              </View>
                            </View>

                            {/* RIGHT BLACK SECTION BAR */}
                            <View style={stylesWeb.sectionBar}>
                              {/* TOP LINE */}
                              <View style={stylesWeb.sectionLine} />

                              {/* TEXT IN MIDDLE */}
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION A
                                </Text>
                              </View>

                              {/* BOTTOM LINE */}
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF INSURANCE HISTORY:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* ROW 1 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    a) Currently covered by any other Mediclaim
                                    / Health Insurance:
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    b) Date of commencement of first Insurance
                                    without break:
                                  </Text>

                                  {/* DATE BOXES */}
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 2 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    c) If yes, company name:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 20 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Policy No.
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 3 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Sum insured (Rs.)
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    d) Have you been hospitalized in the last
                                    four years since inception of the contract?
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>

                                  <Text
                                    style={[
                                      stylesWeb.label,
                                      { marginLeft: 10 },
                                    ]}
                                  >
                                    Date:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["M", "M", "Y", "Y"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 4 */}
                              <View style={stylesWeb.rowBetweenDiagnosis}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Diagnosis:
                                  </Text>
                                  <TextInput style={stylesWeb.longInputWide} />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    e) Previously covered by any other Mediclaim
                                    /Health insurance :
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>
                                </View>
                              </View>

                              {/* ROW 5 */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  f) If yes, company name:
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 22 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>
                            </View>

                            {/* RIGHT SIDE — SECTION B BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION B
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF INSURED PERSON HOSPITALIZED:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* a) NAME */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>a) Name:</Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* b + c + d */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>b) Gender</Text>
                                  <Text style={stylesWeb.smallText}>Male</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>
                                    Female
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    c) Age years
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["Y", "Y"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>

                                  <Text style={stylesWeb.smallText}>
                                    Months
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["M", "M"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    d) Date of Birth
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* e) RELATIONSHIP */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  e) Relationship to Primary insured:
                                </Text>

                                {[
                                  "Self",
                                  "Spouse",
                                  "Child",
                                  "Father",
                                  "Mother",
                                  "Other",
                                ].map((item, i) => (
                                  <React.Fragment key={i}>
                                    <Text style={stylesWeb.smallText}>
                                      {item}
                                    </Text>
                                    <View style={stylesWeb.checkbox} />
                                  </React.Fragment>
                                ))}

                                <Text style={stylesWeb.smallText}>
                                  (Please Specify)
                                </Text>
                                <TextInput style={stylesWeb.longInputWide} />
                              </View>

                              {/* f) OCCUPATION */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  f) Occupation
                                </Text>

                                {[
                                  "Service",
                                  "Self Employed",
                                  "Home Maker",
                                  "Student",
                                  "Retired",
                                  "Other",
                                ].map((item, i) => (
                                  <React.Fragment key={i}>
                                    <Text style={stylesWeb.smallText}>
                                      {item}
                                    </Text>
                                    <View style={stylesWeb.checkbox} />
                                  </React.Fragment>
                                ))}

                                <Text style={stylesWeb.smallText}>
                                  (Please Specify)
                                </Text>
                                <TextInput style={stylesWeb.longInputWide} />
                              </View>

                              {/* g) ADDRESS */}
                              <View style={stylesWeb.addressRow}>
                                <Text style={stylesWeb.label}>
                                  g) Address (if diffrent from above):
                                </Text>

                                <View style={stylesWeb.addressBoxes}>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 40 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 35 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* CITY + STATE */}
                              <View style={stylesWeb.rowBetweens}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>City:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>State:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* PIN + PHONE + EMAIL */}
                              <View style={stylesWeb.rowBetweensLast}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Pin Code:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Phone No:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Email ID:</Text>
                                  <TextInput style={stylesWeb.longInput} />
                                </View>
                              </View>
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION C
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF HOSPITALIZATION:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* a) HOSPITAL NAME */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  a) Name of Hospital where Admitted:
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* b) ROOM CATEGORY */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  b) Room Category occupied:
                                </Text>

                                {[
                                  "Day care",
                                  "Single occupancy",
                                  "Twin sharing",
                                  "3 or more beds per room",
                                ].map((item, i) => (
                                  <React.Fragment key={i}>
                                    <Text style={stylesWeb.smallText}>
                                      {item}
                                    </Text>
                                    <View style={stylesWeb.checkbox} />
                                  </React.Fragment>
                                ))}
                              </View>

                              {/* c + d */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    c) Hospitalization due to:
                                  </Text>

                                  {["Injury", "Illness", "Maternity"].map(
                                    (item, i) => (
                                      <React.Fragment key={i}>
                                        <Text style={stylesWeb.smallText}>
                                          {item}
                                        </Text>
                                        <View style={stylesWeb.checkbox} />
                                      </React.Fragment>
                                    ),
                                  )}
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    d) Date of injury / Date Disease first
                                    detected /Date of Delivery:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* e + f + g + h */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    e) Date of Admission:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>f) Time:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["H", "H", "M", "M"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    g) Date of Discharge:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>h) Time:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["H", "H", "M", "M"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* i + ii + iii */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    i) If injury give cause:
                                  </Text>

                                  {[
                                    "Self inflicted",
                                    "Road Traffic Accident",
                                    "Substance Abuse / Alcohol Consumption",
                                  ].map((item, i) => (
                                    <React.Fragment key={i}>
                                      <Text style={stylesWeb.smallText}>
                                        {item}
                                      </Text>
                                      <View style={stylesWeb.checkbox} />
                                    </React.Fragment>
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    ii) Reported to Police
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    iii. MLC Report & Police FIR attached
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    j) System of Medicine:
                                  </Text>
                                  <TextInput style={stylesWeb.longInputWide} />
                                </View>
                              </View>
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION D
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF CLAIM:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* a) TREATMENT EXPENSES */}
                              <Text style={stylesWeb.label}>
                                a) Details of the Treatment expenses claimed
                              </Text>

                              {/* ROWS */}
                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  i. Pre-hospitalization expenses Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  ii. Hospitalization expenses Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  iii. Post-hospitalization expenses Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  iv. Health-Check up cost Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  v. Ambulance Charges Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  vi. Others (code):
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>Rs.</Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* TOTAL */}
                              <View style={stylesWeb.inlineRows}>
                                <Text
                                  style={[
                                    stylesWeb.label,
                                    {
                                      fontWeight: "500",
                                      fontSize: 30,
                                      justifyContent: "flex-end",
                                    },
                                  ]}
                                >
                                  Total Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBoxs}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* PERIOD */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    vii. Pre-hospitalization period: days
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    viii. Post-hospitalization period: days
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* DOMICILIARY */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  b) Claim for Domiciliary Hospitalization:
                                </Text>
                                <View style={stylesWeb.checkbox} />
                                <Text style={stylesWeb.smallText}>Yes</Text>
                                <View style={stylesWeb.checkbox} />
                                <Text style={stylesWeb.smallText}>No</Text>
                                <Text style={stylesWeb.smallText}>
                                  (If yes, provide details in annexure)
                                </Text>
                              </View>

                              {/* CASH BENEFITS */}
                              <Text style={stylesWeb.label}>
                                c) Details of Lump sum / cash benefit claimed:
                              </Text>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  i. Hospital Daily cash Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  ii. Surgical Cash Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  iii. Critical Illness benefit Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  iv. Convalescence Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  v. Pre/Post hospitalization Lump sum benefit
                                  Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  vi. Others Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>
                            </View>

                            {/* RIGHT CHECKLIST */}
                            <View style={stylesWeb.sectionEChecklist}>
                              <Text style={stylesWeb.label}>
                                Claim Documents Submitted - Check List:
                              </Text>

                              {[
                                "Claim form duly signed",
                                "Copy of the claim intimation, if any",
                                "Hospital Main Bill",
                                "Hospital Break-up Bill",
                                "Hospital Bill Payment Receipt",
                                "Hospital Discharge Summary",
                                "Pharmacy Bill",
                                "Operation Theater Notes",
                                "ECG",
                                "Doctors request for investigation",
                                "Investigation Reports (Including CT MRI / USG / HPE)",
                                "Doctors Prescriptions",
                                "Others",
                              ].map((item, i) => (
                                <View key={i} style={stylesWeb.inlineRow}>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>
                                    {item}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION E
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF BILLS ENCLOSED:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* TABLE */}
                            <View style={stylesWeb.tableContainer}>
                              {/* HEADER ROW */}
                              {/* HEADER ROW 1 */}
                              <View style={stylesWeb.tableRowHeader}>
                                <Text
                                  style={[stylesWeb.tableCell, { width: 50 }]}
                                >
                                  Sl. No.
                                </Text>
                                <Text
                                  style={[stylesWeb.tableCell, { width: 80 }]}
                                >
                                  Bill No.
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 120 }]}
                                >
                                  Date
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 200 }]}
                                >
                                  Issued by
                                </Text>
                                <Text
                                  style={[stylesWeb.tableCell, { flex: 1 }]}
                                >
                                  Towards
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 200 }]}
                                >
                                  Amount (Rs)
                                </Text>
                              </View>

                              {/* HEADER ROW 2 (GRID UNDER DATE & AMOUNT) */}

                              {/* ROWS */}
                              {Array.from({ length: 10 }).map((_, rowIndex) => (
                                <View style={stylesWeb.tableRow}>
                                  <Text
                                    style={[stylesWeb.tableCell, { width: 50 }]}
                                  >
                                    {rowIndex + 1}.
                                  </Text>

                                  <View
                                    style={[stylesWeb.tableCell, { width: 80 }]}
                                  />

                                  {/* DATE CELLS */}
                                  {Array.from({ length: 6 }).map((_, i) => (
                                    <View
                                      key={i}
                                      style={stylesWeb.tableCellSmall}
                                    />
                                  ))}

                                  <View
                                    style={[
                                      stylesWeb.tableCell,
                                      { width: 200 },
                                    ]}
                                  />

                                  <View
                                    style={[stylesWeb.tableCell, { flex: 1 }]}
                                  >
                                    {rowIndex === 0 && "Hospital main Bill"}
                                    {rowIndex === 1 &&
                                      "Pre-hospitalization Bills: Nos"}
                                    {rowIndex === 2 &&
                                      "Post-hospitalization Bills: Nos"}
                                    {rowIndex === 3 && "Pharmacy Bills"}
                                  </View>

                                  {/* AMOUNT CELLS */}
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <View
                                      key={i}
                                      style={stylesWeb.tableCellSmall}
                                    />
                                  ))}
                                </View>
                              ))}
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION F
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DETAILS OF PRIMARY INSURED’S BANK ACCOUNT:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* ROW 1 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>a) PAN:</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    b) Account Number:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 22 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 2 */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  c) Bank Name and Branch:
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* ROW 3 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    d) Cheque / DD Payable details:
                                  </Text>
                                  <TextInput style={stylesWeb.longInputWide} />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    e) IFSC Code:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 11 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION G
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>

                        <View style={stylesWeb.sectionContainer}>
                          {/* DIVIDER */}
                          <View style={stylesWeb.dividerRow}>
                            <View style={stylesWeb.line} />
                            <Text style={stylesWeb.dividerText}>
                              DECLARATION BY THE INSURED:
                            </Text>
                            <View style={stylesWeb.line} />
                          </View>

                          <View style={stylesWeb.sectionContentRow}>
                            {/* LEFT CONTENT */}
                            <View style={{ flex: 1 }}>
                              {/* PARAGRAPH */}
                              <Text style={stylesWeb.declarationText}>
                                I hereby declare that the information furnished
                                in the claim form is true & correct to the best
                                of my knowledge and belief. If I have made any
                                false or untrue statement, suppression or
                                concealment of any material fact with respect to
                                questions asked in relation to this claim, my
                                right to claim reimbursement shall be forfeited.
                                I also consent & authorize TPA / insurance
                                Company, to seek necessary medical information /
                                documents from any hospital / Medical
                                Practitioner who has attended on the person
                                against whom this claim is made. I hereby
                                declare that I have included all the bills /
                                receipts for the purpose of this claim & that I
                                will not be making any supplementary claim,
                                except the pre/post-hospitalization claim, if
                                any.
                              </Text>

                              {/* DATE + PLACE + SIGNATURE */}
                              <View style={stylesWeb.rowBetween}>
                                {/* DATE */}
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Date</Text>
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                {/* PLACE */}
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Place:</Text>
                                  <TextInput style={stylesWeb.placeInput} />
                                </View>

                                {/* SIGNATURE */}
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Signature of the Insured
                                  </Text>
                                  <View style={stylesWeb.signatureBox} />
                                </View>
                              </View>

                              {/* FOOTER NOTE */}
                              <View style={stylesWeb.footerDivider} />
                              <Text style={stylesWeb.footerNote}>
                                (IMPORTANT: PLEASE TURN OVER)
                              </Text>
                            </View>

                            {/* RIGHT BAR */}
                            <View style={stylesWeb.sectionBar}>
                              <View style={stylesWeb.sectionLine} />
                              <View style={stylesWeb.sectionTextWrap}>
                                <Text style={stylesWeb.sectionText}>
                                  SECTION H
                                </Text>
                              </View>
                              <View style={stylesWeb.sectionLine} />
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>
                <View style={stylesWeb.buttonContainer}>
                  <TouchableOpacity style={stylesWeb.outlineBtnWeb}>
                    <Text style={stylesWeb.outlineTextWeb}>Open in editor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={stylesWeb.primaryBtnWeb}
                    onPress={handleDownload}
                  >
                    <Text style={stylesWeb.primaryTextWeb}>
                      Download updated claim
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={stylesWeb.greenOutlineBtnWeb}>
                    <Text style={stylesWeb.greenOutlineTextWeb}>
                      Analyze another claim
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={stylesWeb.greenBtnWeb}>
                    <Text style={stylesWeb.greenTextWeb}>
                      Set up date Integration
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={stylesMobile.container}>
          {/* HEADER */}
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={stylesMobile.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <Text style={stylesMobile.title}>Insurance claim analysis AI</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {/* INFO BOX */}
            <View style={stylesMobile.infoBox}>
              <Text style={stylesMobile.infoText}>
                Updated claim file generated. 5 of 6 suggestions applied. Review
                below, make any final edits, then download.
              </Text>
            </View>

            {/* FILE CARD */}
            <View style={stylesMobile.card}>
              <View style={stylesMobile.fileHeader}>
                <Ionicons name="document-text" size={18} color="#1976D2" />
                <Text style={stylesMobile.fileName}>
                  {analysisData?.structured_data?.source_filename ||
                    "Insurance_Claim_Sharma_Aug2024.pdf"}
                </Text>
              </View>
              <ScrollView
                style={stylesMobile.cardScroll}
                showsVerticalScrollIndicator={true}
              >
                {/* FORM TITLE */}
                <Text style={stylesMobile.formTitle}>
                  REIMBURSEMENT CLAIM FORM
                </Text>

                {/* SECTION: PRIMARY INSURED */}
                <Text style={stylesMobile.sectionTitle}>
                  Details of Primary Insured
                </Text>

                <View style={stylesMobile.row}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <TextInput key={i} style={stylesMobile.box} maxLength={1} />
                  ))}
                </View>

                {/* POLICY NO */}
                <Text style={stylesMobile.label}>Policy No:</Text>
                <View style={stylesMobile.row}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <TextInput key={i} style={stylesMobile.box} maxLength={1} />
                  ))}
                </View>

                {/* NAME */}
                <Text style={stylesMobile.label}>Name:</Text>
                <View style={stylesMobile.row}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <TextInput key={i} style={stylesMobile.box} maxLength={1} />
                  ))}
                </View>

                {/* PHONE */}
                <Text style={stylesMobile.label}>Phone:</Text>
                <View style={stylesMobile.row}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TextInput
                      key={i}
                      style={stylesMobile.box}
                      keyboardType="numeric"
                      maxLength={1}
                    />
                  ))}
                </View>

                {/* EMAIL */}
                <Text style={stylesMobile.label}>Email:</Text>
                <View style={stylesMobile.row}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <TextInput key={i} style={stylesMobile.box} maxLength={1} />
                  ))}
                </View>

                {/* HOSPITAL DETAILS */}
                <Text style={stylesMobile.sectionTitle}>
                  Details of Hospitalization
                </Text>

                <Text style={stylesMobile.label}>Hospital Name:</Text>
                <TextInput
                  style={stylesMobile.fullInput}
                  placeholder="Enter hospital name"
                />

                <Text style={stylesMobile.label}>Admission Date:</Text>
                <TextInput
                  style={stylesMobile.fullInput}
                  placeholder="DD/MM/YYYY"
                />

                <Text style={stylesMobile.label}>Discharge Date:</Text>
                <TextInput
                  style={stylesMobile.fullInput}
                  placeholder="DD/MM/YYYY"
                />

                {/* CLAIM DETAILS */}
                <Text style={stylesMobile.sectionTitle}>Claim Details</Text>

                <Text style={stylesMobile.label}>Total Amount:</Text>
                <TextInput
                  style={stylesMobile.fullInput}
                  placeholder="₹ Enter amount"
                />
              </ScrollView>
            </View>

            {/* BUTTONS */}
            <TouchableOpacity style={stylesMobile.outlineBtn}>
              <Text style={stylesMobile.outlineText}>Open in editor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesMobile.primaryBtn}
              onPress={handleDownload}
            >
              <Text style={stylesMobile.primaryText}>
                Download updated claim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={stylesMobile.greenOutlineBtn}>
              <Text style={stylesMobile.greenOutlineText}>
                Analyze another claim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={stylesMobile.greenBtn}>
              <Text style={stylesMobile.greenText}>
                Set up date Integration
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
}
const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  header: {
    zIndex: 2,
  },

  logo: {
    fontSize: 14,
    fontWeight: "600",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2% ",
  },

  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 18,
  },

  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  fileName: {
    marginLeft: 8,
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "500",
  },

  cardText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },

  link: {
    color: "#2E7D32",
    fontWeight: "500",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  outlineText: {
    fontSize: 14,
    color: "#333",
  },

  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  greenOutlineBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
  },

  greenOutlineText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },

  greenBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },

  greenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardScroll: {
    height: 250, // 🔥 adjust based on UI (150–220 looks good)
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  box: {
    width: 18,
    height: 22,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },

  fullInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 6,
    fontSize: 12,
    marginBottom: 6,
  },
});
const stylesWeb = StyleSheet.create({
  root: {
    flex: 1,
    height: "100vh",
    overflow: "hidden",
  },

  background: {
    flex: 1,
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  mainRow: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  sidebar: {
    width: "15%",
  },
  content: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  headerRow: {
    marginBottom: 16,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  /* ── CARD TITLE ROW ── */
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    marginBottom: 6,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: "#111827" },
  backToHomeBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  backToHomeBtnText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  /* ── STEP BAR ── */
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepCircleDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepTick: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderColor: "#2563EB",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  stepNumActive: {
    color: "#2563EB",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepLabelActive: {
    color: "#2563EB",
  },
  stepSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  stepConnector: {
    height: 2,
    width: 32,
    backgroundColor: "#2563EB",
    marginHorizontal: 6,
    alignSelf: "center",
    flexShrink: 0,
  },
  formHeaderContainer: {
    paddingVertical: 10,
  },

  formTopRow: {
    flexDirection: "row",
    alignItems: "center", // 🔥 aligns logo + title perfectly same line
    justifyContent: "space-between",
  },

  logoRow: {
    flexDirection: "column",
    alignItems: "center",
    width: "20%",
  },

  logo: {
    width: 65,
    height: 60,
    marginRight: 6,
  },

  logoText: {
    fontSize: 16,
    color: "#2F5597",
    fontWeight: "500",
  },

  centerTitleBlock: {
    width: "60%",
    alignItems: "center",
  },

  formMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  formSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    color: "#000",
  },

  formNoteCenter: {
    fontSize: 13,
    marginTop: 2,
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },

  formNoteRight: {
    flex: 1,
    fontSize: 12,
    textAlign: "right",
    color: "#000",
    paddingRight: 10,
    whiteSpace: "nowrap",
    fontWeight: "700",
  },
  sectionContainer: {
    marginTop: 10,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionContentRow: {
    flexDirection: "row",
  },

  rowBetween: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  rowBetweenDiagnosis: {
    flexDirection: "row",
    gap: 120,
    marginBottom: 6,
  },
  rowBetweens: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 6,
    marginLeft: "7%",
  },
  rowBetweensLast: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 6,
    marginLeft: "7%",
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  inlineRows: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    marginRight: 6,
  },

  boxRow: {
    flexDirection: "row",
  },

  boxWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "85%",
  },

  squareBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },
  squareBoxs: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },

  longInput: {
    width: 180,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },
  sectionBar: {
    width: 28,
    alignItems: "center",
    marginLeft: 6,
  },

  sectionLine: {
    flex: 1,
    width: 10,
    backgroundColor: "#000",
    marginVertical: 2, // small breathing space
  },

  sectionTextWrap: {
    paddingVertical: 19, // 🔥 more gap from black bars
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
    transform: [{ rotate: "90deg" }],
    whiteSpace: "nowrap", // 🔥 prevent breaking
  },
  addressContainer: {
    flexDirection: "column",
    marginLeft: 2, // 🔥 tiny gap after label (aligns perfectly)
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start", // 🔥 KEY: aligns label with FIRST ROW (top)
    marginBottom: 6,
  },

  addressBoxes: {
    flexDirection: "column",
    marginLeft: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 4,
  },

  smallText: {
    fontSize: 11,
    marginRight: 6,
  },

  longInputWide: {
    width: 300,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },
  sectionEChecklist: {
    width: 260,
    marginLeft: 10,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 32,
  },

  tableCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    fontSize: 11,
    justifyContent: "center",
  },

  squareBoxSmall: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 9,
    padding: 0,
  },
  tableInnerCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  tableCellSmall: {
    width: 20, // 🔥 controls grid density
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 9,
  },
  declarationText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
    textAlign: "left",
  },

  placeInput: {
    width: 200,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },

  signatureBox: {
    width: 220,
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
  },

  footerNote: {
    textAlign: "right",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#000",
    marginTop: 10,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    marginLeft: "2%",
    marginRight: "2%",
  },

  outlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  outlineTextWeb: {
    fontSize: 14,
    color: "#333",
  },

  primaryBtnWeb: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryTextWeb: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  greenOutlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
  },

  greenOutlineTextWeb: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },

  greenBtnWeb: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },

  greenTextWeb: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
