import React from "react";
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import DashboardInsuranceBarChart from "../../components/HospitalPortalComponent/DashboardInsuranceBarChart";
import DashboardSettlementChart from "../../components/HospitalPortalComponent/DashboardSettlementChart";
import DashboardPostOpRevenueChart from "../../components/HospitalPortalComponent/DashboardPostOpRevenueChart";
import DashboardHospitalRevenueChart from "../../components/HospitalPortalComponent/DashboardHospitalRevenueChart";
import DashboardProviderRateSection from "../../components/HospitalPortalComponent/DashboardProviderRateSection";
import MobileDashboardCards from "../../components/HospitalPortalComponent/MobileDashboardCards";
import MobileDashboardInsuranceBreakdown from "../../components/HospitalPortalComponent/MobileDashboardInsuranceBreakdown";
import MobileDashboardSettlementSpeciality from "../../components/HospitalPortalComponent/MobileDashboardSettlementSpeciality";
import DashboardDoctorTable from "../../components/HospitalPortalComponent/DashboardDoctorTable";
import MobileDashboardPostOpRevenue from "../../components/HospitalPortalComponent/MobileDashboardPostOpRevenue";

const { width, height } = Dimensions.get("window");
const HospitalDashboard = ({ navigation, route }) => {
  const { width } = useWindowDimensions();

  const cards = [
    { title: "Total Reimbursed", value: "₹84.2L", growth: "↑ 15.8%" },
    { title: "Claim Approved", value: "1,235" },
    { title: "Pending", value: "134" },
    { title: "Avg TAT", value: "2.4d" },
    { title: "INR Saving", value: "₹22.6L" },
    { title: "Post OP Rev", value: "₹38.4L" },
  ];

  const diagnosisData = [
    { name: "Cardiac Bypass", value: 92 },
    { name: "Knee Replacement", value: 80 },
    { name: "Craniotomy", value: 76 },
    { name: "Hip Arthroplasty", value: 60 },
    { name: "Appendectomy", value: 59 },
  ];

  // max value for percentage calculation
  const maxValue = Math.max(...diagnosisData.map((item) => item.value));

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.imageBackground}>
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <HospitalSidebarNavigation navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  {/* HEADER (fixed) */}
                  {/* <View style={styles.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View> */}

                  {/* SCROLLABLE CONTENT */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {/* ===== TOP CARDS ===== */}
                    <View style={styles.cardsRow}>
                      {cards.map((item, index) => (
                        <View key={index} style={styles.card}>
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <Text style={styles.cardValue}>{item.value}</Text>
                          {item.growth && (
                            <Text style={styles.growth}>{item.growth}</Text>
                          )}
                        </View>
                      ))}
                    </View>

                    {/* ===== TOP CHARTS ===== */}
                    <View style={styles.TopChartSection}>
                      <View style={styles.InsuranceChartSection}>
                        <DashboardInsuranceBarChart />
                      </View>
                      <View style={styles.SettlementChartSection}>
                        <DashboardSettlementChart />
                      </View>
                    </View>

                    {/* ===== MIDDLE CHART ===== */}
                    <View style={styles.MiddleChartSection}>
                      <View style={styles.RevenueChartSection}>
                        <DashboardPostOpRevenueChart />
                      </View>
                      <View style={styles.DiagnosisSection}>
                        <Text style={styles.diagnosisTitle}>Top Diagnosis</Text>

                        {diagnosisData.map((item, index) => {
                          const percentage = (item.value / maxValue) * 100;

                          return (
                            <View key={index} style={styles.diagnosisItem}>
                              {/* Label Row */}
                              <View style={styles.diagnosisRow}>
                                <Text style={styles.diagnosisLabel}>
                                  {item.name}
                                </Text>
                                <Text style={styles.diagnosisValue}>
                                  {item.value}L
                                </Text>
                              </View>

                              {/* Progress Bar */}
                              <View style={styles.progressBg}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    { width: `${percentage}%` },
                                  ]}
                                />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    {/* ====== BOTTOM CHART ====== */}
                    <View style={styles.BottomChartSection}>
                      <View style={styles.HospitalRevenueChartSection}>
                        <DashboardHospitalRevenueChart />
                      </View>
                      <View style={styles.ProviderRateSection}>
                        <DashboardProviderRateSection />
                      </View>
                    </View>
                    <DashboardDoctorTable/>
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <View style={MobileStyles.appContainer}>
          <View style={MobileStyles.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <MobileDashboardCards />
            <MobileDashboardInsuranceBreakdown />
            <MobileDashboardSettlementSpeciality />
            <View style={MobileStyles.MobileDiagnosisSection}>
              <Text style={MobileStyles.MobilediagnosisTitle}>Top Diagnosis</Text>

              {diagnosisData.map((item, index) => {
                const percentage = (item.value / maxValue) * 100;

                return (
                  <View key={index} style={MobileStyles.diagnosisItem}>
                    {/* Label Row */}
                    <View style={styles.diagnosisRow}>
                      <Text style={styles.diagnosisLabel}>{item.name}</Text>
                      <Text style={styles.diagnosisValue}>{item.value}L</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <MobileDashboardPostOpRevenue/>
            <DashboardProviderRateSection />
            <DashboardDoctorTable/>
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    // backgroundColor: "pink",
  },
  imageContainer: {
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
    backgroundColor: "#F1F7FF",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    //borderWidth: 1,
  },
  Right: {
    height: "100%",
    width: "85%",
  },
  header: {
    // borderWidth: 5,
    // borderColor: "black",
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
        //borderWidth:1,
        backgroundColor: "#fff",
      },
    }),
  },
  scrollContent: {
    paddingBottom: 40, // gives bottom spacing
    marginTop:"2%"
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    //borderWidth:1,
    paddingTop: "1%",
    paddingHorizontal: "0.7%",
  },

  card: {
    backgroundColor: "#fff",
    width: "15.5%",
    borderRadius: 14,
    padding: 14,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 12,
    color: "#6B7280",
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },

  growth: {
    fontSize: 12,
    color: "green",
    marginTop: 4,
  },

  //   TopChartSection: {
  //     height: "45%",
  //     width: "98%",
  //     alignSelf: "center",
  //     marginTop: "1%",
  //     flexDirection: "row",
  //     gap: 10,
  //   },
  TopChartSection: {
    width: "98%",
    alignSelf: "center",
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },

  InsuranceChartSection: {
    flex: 6,
  },

  SettlementChartSection: {
    flex: 2,
    backgroundColor: "#fff",
    borderRadius: 14,
  },
  //   MiddleChartSection: {
  //     height: "45%",
  //     width: "98%",
  //     alignSelf: "center",
  //     marginTop: "1%",
  //     borderWidth: 1,
  //     flexDirection: "row",
  //     gap: 10,
  //   },
  MiddleChartSection: {
    width: "98%",
    alignSelf: "center",
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  RevenueChartSection: {
    flex: 6,
  },
  DiagnosisSection: {
    flex: 1.8,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  diagnosisTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  diagnosisItem: {
    marginBottom: 10,
  },

  diagnosisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  diagnosisLabel: {
    fontSize: 15,
    color: "#374151",
  },

  diagnosisValue: {
    fontSize: 15,
    color: "#393d44ff",
  },

  progressBg: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#7B61FF",
    borderRadius: 6,
  },
  BottomChartSection: {
    width: "98%",
    alignSelf: "center",
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  HospitalRevenueChartSection: {
    flex: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
  },
  ProviderRateSection: {
    flex: 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    //padding: 16,
  },
});

const MobileStyles = StyleSheet.create({
  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#F1F7FF",
    // backgroundColor: "pink",
  },
  header: {
    //borderWidth: 1,
    paddingHorizontal: "2%",
    backgroundColor: "#fff",
  },
  MobileDiagnosisSection:{
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    margin:"3%"
  },
  MobilediagnosisTitle:{
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  diagnosisItem:{
    marginTop:"3%"
  }

});

export default HospitalDashboard;
