import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const DashboardSettlementChart = () => {
  const data = [
    { value: 1248, color: "#7B61FF", label: "Cardiac" },
    { value: 134, color: "#FF8A80", label: "Orthopedic" },
    { value: 67, color: "#4DD0E1", label: "General Surg" },
    { value: 42, color: "#FDBA74", label: "Neurology" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    // <View style={styles.container}>
      
    //   {/* Title */}
    //   <Text style={styles.title}>Settlement by specialty</Text>

    //   <View style={styles.row}>
        
    //     {/* Donut Chart */}
    //     <PieChart
    //       data={data}
    //       donut
    //       radius={90}
    //       innerRadius={65} // 🔥 thickness control
    //       strokeWidth={0}
    //       showGradient={false}
    //       marginLeft="10%"
    //       innerCircleColor={"#fff"}
    //       centerLabelComponent={() => (
    //         <View style={styles.centerContainer}>
    //           <Text style={styles.centerValue}>{total}</Text>
    //         </View>
    //       )}
    //     />

    //     {/* Legend */}
    //     <View style={styles.legendContainer}>
    //       {data.map((item, index) => (
    //         <View key={index} style={styles.legendItem}>
    //           <View
    //             style={[styles.dot, { backgroundColor: item.color }]}
    //           />
    //           <Text style={styles.legendLabel}>{item.label}</Text>
    //           <Text style={styles.legendValue}>{item.value}</Text>
    //         </View>
    //       ))}
    //     </View>

    //   </View>
    // </View>
    <View style={styles.container}>
  
  {/* Title */}
  <Text style={styles.title}>Settlement by specialty</Text>

  {/* Center Chart */}
  <View style={styles.chartSection}>
    <PieChart
      data={data}
      donut
      radius={90}
      innerRadius={65}
      strokeWidth={0}
      showGradient={false}
      innerCircleColor={"#fff"}
      centerLabelComponent={() => (
        <View style={styles.centerContainer}>
          <Text style={styles.centerValue}>{total}</Text>
        </View>
      )}
    />
  </View>

  {/* Legend (bottom) */}
  <View style={styles.legendContainer}>
    {data.map((item, index) => (
      <View key={index} style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
        <Text style={styles.legendLabel}>{item.label}</Text>
        <Text style={styles.legendValue}>{item.value}</Text>
      </View>
    ))}
  </View>

</View>
  );
};

const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//   },

//   title: {
//     fontSize: 15,
//     fontWeight: "600",
//     marginBottom: 10,
//   },

//   row: {
//     flexDirection: "column",
//     //alignItems: "center",
//     justifyContent: "space-between",
//   },

//   centerContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   centerValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111827",
//   },

//   legendContainer: {
//     marginLeft: 10,
//   },

//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 8,
//   },

//   legendLabel: {
//     fontSize: 12,
//     color: "#374151",
//     width: 90,
//   },

//   legendValue: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#111827",
//   },
container: {
  flex: 1,
  backgroundColor: "#fff",
  borderRadius: 14,
  padding: 16,
},

title: {
  fontSize: 15,
  fontWeight: "600",
},

chartSection: {
  flex: 1,                  
  justifyContent: "center", 
  alignItems: "center",        
},

legendContainer: {
  marginTop: 10,
},

legendItem: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 8,
},

legendLabel: {
  fontSize: 14,
  color: "#374151",
  width: 90,
},

legendValue: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},
});

export default DashboardSettlementChart;