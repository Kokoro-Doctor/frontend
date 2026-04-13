// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// const providerData = [
//   { name: "Star Health", claim: 88 },
//   { name: "HDFC", claim: 82 },
//   { name: "Bajaj Allianz", claim: 72 },
//   { name: "New India", claim: 61 },
// ];

// const DashboardProviderRateSection = () => {
//   return (
//     <View style={styles.card}>
//       {/* ── Header ── */}
//       <View style={styles.header}>
//         <View style={styles.iconWrapper}>
//           <View style={styles.checkIcon} />
//         </View>
//         <Text style={styles.title}>Provider Rate</Text>
//       </View>

//       {/* ── Provider Rows ── */}
//       <View style={styles.listWrapper}>
//         {providerData.map((item, index) => (
//           <View key={index} style={styles.providerRow}>
//             {/* Name + Claim % */}
//             <View style={styles.labelRow}>
//               <Text style={styles.providerName}>{item.name}</Text>
//               <Text style={styles.claimPercent}>Claim {item.claim}%</Text>
//             </View>
//             {/* Progress Bar */}
//             <View style={styles.progressBg}>
//               <View style={[styles.progressFill, { width: `${item.claim}%` }]} />
//             </View>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },

//   /* Header */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 24,
//   },
//   iconWrapper: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     backgroundColor: "#3B82F6",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   checkIcon: {
//     width: 16,
//     height: 16,
//     borderWidth: 2.5,
//     borderColor: "#FFFFFF",
//     borderRadius: 3,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//     letterSpacing: -0.3,
//   },

//   /* List */
//   listWrapper: {
//     flex: 1,
//     justifyContent: "space-around",
//   },
//   providerRow: {
//     marginBottom: 18,
//   },
//   labelRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   providerName: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#1F2937",
//   },
//   claimPercent: {
//     fontSize: 14,
//     color: "#9CA3AF",
//     fontWeight: "400",
//   },

//   /* Progress bar */
//   progressBg: {
//     height: 10,
//     backgroundColor: "#E5F9F6",
//     borderRadius: 6,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#2DD4BF",  // teal/cyan matching Figma
//     borderRadius: 6,
//   },
// });

// export default DashboardProviderRateSection;


import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";

const providerData = [
  { name: "Star Health",   claim: 88 },
  { name: "HDFC",          claim: 82 },
  { name: "Bajaj Allianz", claim: 72 },
  { name: "New India",     claim: 61 },
];

const DashboardProviderRateSection = () => {
  const { width } = useWindowDimensions();
  const isMobile  = Platform.OS !== "web" || width < 1000;

  return isMobile ? <MobileView /> : <WebView />;
};

/* ─────────────────────────── WEB VERSION ─────────────────────────── */
const WebView = () => (
  <View style={webStyles.card}>
    <View style={webStyles.header}>
      <View style={webStyles.iconWrapper}>
        <View style={webStyles.checkIcon} />
      </View>
      <Text style={webStyles.title}>Provider Rate</Text>
    </View>

    <View style={webStyles.listWrapper}>
      {providerData.map((item, index) => (
        <View key={index} style={webStyles.providerRow}>
          <View style={webStyles.labelRow}>
            <Text style={webStyles.providerName}>{item.name}</Text>
            <Text style={webStyles.claimPercent}>Claim {item.claim}%</Text>
          </View>
          <View style={webStyles.progressBg}>
            <View style={[webStyles.progressFill, { width: `${item.claim}%` }]} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

/* ────────────────────────── MOBILE VERSION ───────────────────────── */
const MobileView = () => (
  <View style={mobileStyles.card}>
    {/* Header */}
    <View style={mobileStyles.header}>
      {/* <View style={mobileStyles.iconWrapper}>
        <Text style={mobileStyles.iconText}>✦</Text>
      </View> */}
      <Text style={mobileStyles.title}>Provider Rate</Text>
    </View>

    {/* Provider rows */}
    <View style={mobileStyles.listWrapper}>
      {providerData.map((item, index) => (
        <View key={index} style={mobileStyles.providerRow}>
          {/* Label row */}
          <View style={mobileStyles.labelRow}>
            <View style={mobileStyles.nameLeft}>
              {/* colored rank dot */}
              <View style={[mobileStyles.rankDot, { backgroundColor: RANK_COLORS[index] }]} />
              <Text style={mobileStyles.providerName}>{item.name}</Text>
            </View>
            <Text style={mobileStyles.claimPercent}>{item.claim}%</Text>
          </View>

          {/* Progress bar */}
          <View style={mobileStyles.progressBg}>
            <View
              style={[
                mobileStyles.progressFill,
                {
                  width: `${item.claim}%`,
                  backgroundColor: RANK_COLORS[index],
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>

    {/* Footer caption */}
    <Text style={mobileStyles.caption}>Based on last 6 months claim data</Text>
  </View>
);

const RANK_COLORS = ["#2DD4BF", "#7B61FF", "#F59E0B", "#FF6B6B"];

/* ─────────────────────────── WEB STYLES ──────────────────────────── */
const webStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 16,
    height: 16,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    borderRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  listWrapper: {
    flex: 1,
    justifyContent: "space-around",
  },
  providerRow: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  claimPercent: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  progressBg: {
    height: 10,
    backgroundColor: "#E5F9F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2DD4BF",
    borderRadius: 6,
  },
});

/* ───────────────────────── MOBILE STYLES ─────────────────────────── */
const mobileStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 14,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web:     { boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
    }),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
    color: "#3B82F6",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },

  listWrapper: {
    gap: 18,
  },
  providerRow: {
    // each row
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  claimPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  progressBg: {
    height: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  caption: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 20,
    textAlign: "center",
  },
});

export default DashboardProviderRateSection;