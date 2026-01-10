import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { API_URL } from "../../../env-vars";
import { useAuth } from "../../../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const DoctorAppointmentScreen = ({
  navigation,
  selectedCategory,
  priorityDoctors,
  route,
}) => {
  const { width } = useWindowDimensions();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorsToShow, setDoctorsToShow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCounts, setSubscriberCounts] = useState({});
  const { user } = useAuth();
  const userIdentifier = user?.user_id || user?.email || null;
  const normalizeDoctorId = (doctor) =>
    String(doctor?.doctor_id ?? doctor?.id ?? "");
  const [showFull, setShowFull] = useState(false);
  const [activeSubscriptionDoctorId, setActiveSubscriptionDoctorId] =
    useState(null);
  // const [bookedDoctorIds, setBookedDoctorIds] = useState(new Set());
  const [bookedCountByDoctor, setBookedCountByDoctor] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/doctorsService/doctors`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        //console.log("📦 Raw API response:", data);
        let fetchedDoctors = data.doctors || [];
        console.log("👨‍⚕️ Fetched doctors count:", fetchedDoctors.length);
        console.log("👨‍⚕️ Fetched doctors:", fetchedDoctors);

        const sortedDoctors = [
          ...fetchedDoctors.filter((doc) =>
            priorityDoctors.includes(doc.doctorname)
          ),
          ...fetchedDoctors.filter(
            (doc) => !priorityDoctors.includes(doc.doctorname)
          ),
        ];
        //console.log("🔝 Sorted doctors count:", sortedDoctors.length);

        setAllDoctors(sortedDoctors);
        setDoctorsToShow(sortedDoctors);

        // Set subscriber counts
        const counts = sortedDoctors.reduce((acc, doctor) => {
          const key = normalizeDoctorId(doctor);
          if (key) {
            acc[key] = doctor.subscribers?.length || 0;
          }
          return acc;
        }, {});
        setSubscriberCounts(counts);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [priorityDoctors]);

  useEffect(() => {
    if (!allDoctors.length) return;

    const categoryValue = selectedCategory?.value?.toLowerCase().trim() || "";

    // If no category selected or 'Select', show all doctors
    if (categoryValue === "") {
      //console.log("🟢 Default category selected — showing all doctors");
      setDoctorsToShow(allDoctors);
      return;
    }

    // Otherwise, filter by category match
    const filtered = allDoctors.filter((doc) => {
      const docCategory = doc.category?.toLowerCase().trim() || "";
      return (
        docCategory.includes(categoryValue) ||
        docCategory.includes(selectedCategory?.label?.toLowerCase().trim())
      );
    });

    // console.log(
    //   "✅ Filtered doctors:",
    //   filtered.length,
    //   "for",
    //   selectedCategory.label
    // );
    setDoctorsToShow(filtered);
  }, [selectedCategory, allDoctors]);

  // const fetchUserSubscription = async () => {
  //   if (!user?.user_id) return;

  //   try {
  //     const res = await fetch(
  //       `${API_URL}/booking/users/${user.user_id}/subscriptions`
  //     );
  //     const data = await res.json();

  //     const now = new Date();

  //     const activeSub = data.find((s) => {
  //       const endDate = s.end_date ? new Date(s.end_date) : null;

  //       return (
  //         ["ACTIVE", "USED", "EXHAUSTED"].includes(s.status) &&
  //         (!endDate || endDate > now)
  //       );
  //     });

  //     if (activeSub) {
  //       setActiveSubscriptionDoctorId({
  //         doctorId: String(activeSub.doctor_id),
  //         expiry: activeSub.end_date,
  //         total: Number(activeSub.consultations_total ?? 0),
  //         used: Number(activeSub.consultations_used ?? 0),
  //       });
  //     } else {
  //       setActiveSubscriptionDoctorId(null);
  //     }
  //   } catch (err) {
  //     console.error("❌ Subscription fetch failed:", err);
  //   }
  // };

  const fetchUserSubscription = async () => {
    if (!user?.user_id) return;

    try {
      const res = await fetch(
        `${API_URL}/booking/users/${user.user_id}/subscriptions`
      );
      const data = await res.json();

      console.log("📡 Full Subscription Response:", data);

      const now = new Date();

      const activeSub = data.find((s) => {
        const endDate = s.end_date ? new Date(s.end_date) : null;

        return (
          ["ACTIVE", "USED", "EXHAUSTED"].includes(s.status) &&
          (!endDate || endDate > now)
        );
      });

      if (activeSub) {
        // ✅ FIXED: Use correct field names from backend
        const totalConsultations = Number(
          activeSub.appointments_total || activeSub.consultations_total || 0
        );
        const usedConsultations = Number(
          activeSub.appointments_used || activeSub.consultations_used || 0
        );

        console.log("✅ Active subscription found:", {
          doctorId: activeSub.doctor_id,
          total: totalConsultations,
          used: usedConsultations,
          remaining: totalConsultations - usedConsultations,
          expiry: activeSub.end_date,
          status: activeSub.status,
        });

        setActiveSubscriptionDoctorId({
          doctorId: String(activeSub.doctor_id),
          expiry: activeSub.end_date,
          total: totalConsultations,
          used: usedConsultations,
        });
      } else {
        console.log("❌ No active subscription found");
        setActiveSubscriptionDoctorId(null);
      }
    } catch (err) {
      console.error("❌ Subscription fetch failed:", err);
    }
  };

  // const fetchUserAppointments = async () => {
  //   if (!user?.user_id) return;

  //   try {
  //     const res = await fetch(
  //       `${API_URL}/booking/users/${user.user_id}/bookings?type=upcoming`
  //     );

  //     const data = await res.json();

  //     const appointmentsArray = Array.isArray(data)
  //       ? data
  //       : Array.isArray(data.appointments)
  //       ? data.appointments
  //       : [];

  //     const countMap = {};

  //     appointmentsArray.forEach((a) => {
  //       if (
  //         a.doctor_id &&
  //         a.slot_time &&
  //         ["BOOKED", "CONFIRMED"].includes(a.status)
  //       ) {
  //         const id = String(a.doctor_id);
  //         countMap[id] = (countMap[id] || 0) + 1;
  //       }
  //     });

  //     setBookedCountByDoctor(countMap);
  //   } catch (err) {
  //     console.error("❌ Appointment fetch failed:", err);
  //   }
  // };

  const fetchUserAppointments = async () => {
    if (!user?.user_id) return;

    try {
      const res = await fetch(
        `${API_URL}/booking/users/${user.user_id}/bookings?type=upcoming`
      );

      const data = await res.json();
      console.log("📡 Appointments Response:", data);

      const appointmentsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.appointments)
        ? data.appointments
        : [];

      const countMap = {};

      appointmentsArray.forEach((a) => {
        if (
          a.doctor_id &&
          a.slot_time &&
          ["BOOKED", "CONFIRMED"].includes(a.status)
        ) {
          const id = String(a.doctor_id);
          countMap[id] = (countMap[id] || 0) + 1;
        }
      });

      console.log("📊 Booked counts by doctor:", countMap);
      setBookedCountByDoctor(countMap);
    } catch (err) {
      console.error("❌ Appointment fetch failed:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        console.log("🔁 Screen focused → refetch subscription");
        fetchUserSubscription();
        fetchUserAppointments(); // ✅ ADD THIS
      }
    }, [user?.user_id])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading doctors...</Text>
      </View>
    );
  }

  if (doctorsToShow.length === 0) {
    return (
      <View style={styles.center}>
        <Text>
          No doctors found for {selectedCategory?.label || "this category"}
        </Text>
      </View>
    );
  }

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <FlatList
            data={doctorsToShow}
            keyExtractor={(item, index) =>
              normalizeDoctorId(item) || index.toString()
            }
            renderItem={({ item }) => {
              // const doctorId = normalizeDoctorId(item);

              // const subscription = activeSubscriptionDoctorId;

              // const hasActiveSubscription =
              //   subscription &&
              //   subscription.doctorId &&
              //   (!subscription.expiry ||
              //     new Date(subscription.expiry) > new Date());

              // const isSubscribedToThisDoctor =
              //   hasActiveSubscription && subscription.doctorId === doctorId;

              // const consultationsRemaining = hasActiveSubscription
              //   ? subscription.total - subscription.used
              //   : 0;

              // const isAlreadyBooked = bookedDoctorIds.has(doctorId);

              // const canBookMore =
              //   isSubscribedToThisDoctor &&
              //   consultationsRemaining > 0 &&
              //   !isAlreadyBooked;

              // const buttonText = (() => {
              //   // Subscribed doctor
              //   if (isSubscribedToThisDoctor) {
              //     if (isAlreadyBooked && consultationsRemaining === 0)
              //       return "Booked";
              //     return "Book Slot";
              //   }

              //   // Other doctors when subscription exists
              //   if (hasActiveSubscription) return "Subscribe later";

              //   // No subscription at all
              //   return "Subscribe";
              // })();

              // const isDisabled =
              //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              //   isAlreadyBooked;
              //const isDisabled = isAlreadyBooked;

              // const isDisabled =
              //   // Disable other doctors when subscription exists
              //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              //   // Disable booked doctor only when no consultations left
              //   (isSubscribedToThisDoctor &&
              //     isAlreadyBooked &&
              //     consultationsRemaining === 0);

              // const doctorId = normalizeDoctorId(item);
              // const subscription = activeSubscriptionDoctorId;

              // const hasActiveSubscription =
              //   subscription &&
              //   subscription.doctorId &&
              //   (!subscription.expiry ||
              //     new Date(subscription.expiry) > new Date());

              // const isSubscribedToThisDoctor =
              //   hasActiveSubscription && subscription.doctorId === doctorId;

              // const totalAllowed = subscription?.total ?? 0;
              // const bookedCount = bookedCountByDoctor[doctorId] || 0;

              // const hasReachedLimit = bookedCount >= totalAllowed;

              // const canBookMore = isSubscribedToThisDoctor && !hasReachedLimit;
              // const buttonText = (() => {
              //   if (isSubscribedToThisDoctor) {
              //     if (hasReachedLimit) return "Booked";
              //     return "Book Slot";
              //   }

              //   if (hasActiveSubscription) return "Subscribe later";

              //   return "Subscribe";
              // })();

              // const isDisabled =
              //   // Other doctors blocked when subscription exists
              //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              //   // Block only when limit reached
              //   (isSubscribedToThisDoctor && hasReachedLimit);

              // const doctorId = normalizeDoctorId(item);
              // const subscription = activeSubscriptionDoctorId;

              // /**
              //  * 1️⃣ Subscription validity
              //  */
              // const hasActiveSubscription =
              //   subscription &&
              //   subscription.doctorId &&
              //   (!subscription.expiry ||
              //     new Date(subscription.expiry) > new Date());

              // // const hasActiveSubscription =
              // //   subscription &&
              // //   subscription.doctorId &&
              // //   subscription.expiry &&
              // //   new Date(subscription.expiry) > new Date();

              // const isSubscribedToThisDoctor =
              //   hasActiveSubscription && subscription.doctorId === doctorId;

              // /**
              //  * 2️⃣ Booking counts
              //  */
              // // const totalAllowed = Number(subscription?.total ?? 0);
              // // const bookedCount = Number(bookedCountByDoctor[doctorId] ?? 0);
              // const totalAllowed = Number(subscription?.total ?? 0);
              // const used = Number(subscription?.used ?? 0);

              // /**
              //  * 3️⃣ Guard: only evaluate limit if subscribed
              //  */
              // // const hasLimit = isSubscribedToThisDoctor && totalAllowed > 0;
              // // const hasReachedLimit = hasLimit && bookedCount >= totalAllowed;

              // // const canBookMore =
              // //   isSubscribedToThisDoctor && hasLimit && !hasReachedLimit;

              // const hasReachedLimit =
              //   isSubscribedToThisDoctor &&
              //   totalAllowed > 0 &&
              //   used >= totalAllowed;

              // const canBookMore = isSubscribedToThisDoctor && !hasReachedLimit;

              // /**
              //  * 5️⃣ Button text
              //  */
              // // const buttonText = (() => {
              // //   if (isSubscribedToThisDoctor) {
              // //     if (hasReachedLimit) return "Booked";
              // //     return "Book Slot";
              // //   }

              // //   if (hasActiveSubscription) return "Subscribe later";

              // //   return "Subscribe";
              // // })();

              // const buttonText = (() => {
              //   if (isSubscribedToThisDoctor) {
              //     return hasReachedLimit ? "Booked" : "Book Slot";
              //   }

              //   if (hasActiveSubscription) return "Subscribe later";

              //   return "Subscribe";
              // })();

              // /**
              //  * 6️⃣ Disable logic
              //  */
              // // const isDisabled =
              // //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              // //   (isSubscribedToThisDoctor && hasReachedLimit);
              // const isDisabled =
              //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              //   hasReachedLimit;

              // Replace the mobile view's subscription validation (around line 780-800)

              // const doctorId = normalizeDoctorId(item);
              // const subscription = activeSubscriptionDoctorId;

              // /**
              //  * 1️⃣ Subscription validity - FIXED
              //  */
              // const hasActiveSubscription =
              //   subscription &&
              //   subscription.doctorId &&
              //   (!subscription.expiry ||
              //     new Date(subscription.expiry) > new Date());

              // const isSubscribedToThisDoctor =
              //   hasActiveSubscription && subscription.doctorId === doctorId;

              // /**
              //  * 2️⃣ Booking counts - Using API's "used" field
              //  */
              // const totalAllowed = Number(subscription?.total ?? 0);
              // const used = Number(subscription?.used ?? 0);

              // /**
              //  * 3️⃣ Check if limit reached
              //  */
              // const hasReachedLimit =
              //   isSubscribedToThisDoctor &&
              //   totalAllowed > 0 &&
              //   used >= totalAllowed;

              // const canBookMore = isSubscribedToThisDoctor && !hasReachedLimit;

              // /**
              //  * 4️⃣ Button text
              //  */
              // const buttonText = (() => {
              //   if (isSubscribedToThisDoctor) {
              //     return hasReachedLimit ? "Booked" : "Book Slot";
              //   }
              //   if (hasActiveSubscription) return "Subscribe later";
              //   return "Subscribe";
              // })();

              // /**
              //  * 5️⃣ Disable logic
              //  */
              // const isDisabled =
              //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
              //   hasReachedLimit;

              const doctorId = normalizeDoctorId(item);
              const subscription = activeSubscriptionDoctorId;

              console.log(`🔍 Checking doctor ${doctorId}:`, {
                subscription,
                bookedCount: bookedCountByDoctor[doctorId],
              });

              /**
               * 1️⃣ Check if subscription is valid
               */
              const hasActiveSubscription =
                subscription &&
                subscription.doctorId &&
                (!subscription.expiry ||
                  new Date(subscription.expiry) > new Date());

              const isSubscribedToThisDoctor =
                hasActiveSubscription && subscription.doctorId === doctorId;

              /**
               * 2️⃣ Get consultation limits
               */
              // ⚠️ CRITICAL FIX: If total is 0, use default plan value (usually 3)
              const DEFAULT_CONSULTATIONS = 3; // Change this to match your plan
              const totalAllowed =
                Number(subscription?.total ?? 0) || DEFAULT_CONSULTATIONS;
              const usedFromAPI = Number(subscription?.used ?? 0);

              // Also check local booked count as backup
              const bookedCount = bookedCountByDoctor[doctorId] || 0;

              // Use the MAXIMUM of API "used" or local count to be safe
              const actualUsed = Math.max(usedFromAPI, bookedCount);

              const remainingSlots = totalAllowed - actualUsed;

              console.log(`📊 Doctor ${doctorId} slots:`, {
                total: totalAllowed,
                usedFromAPI,
                bookedCount,
                actualUsed,
                remaining: remainingSlots,
              });

              /**
               * 3️⃣ Determine if limit reached
               */
              const hasReachedLimit =
                isSubscribedToThisDoctor &&
                totalAllowed > 0 &&
                actualUsed >= totalAllowed;

              const canBookMore =
                isSubscribedToThisDoctor && remainingSlots > 0;

              /**
               * 4️⃣ Button text with remaining slots
               */
              const buttonText = (() => {
                if (isSubscribedToThisDoctor) {
                  if (hasReachedLimit) {
                    return "Booked";
                  }
                  // Show remaining slots
                  return remainingSlots > 1
                    ? `Book Slot (${remainingSlots} left)`
                    : "Book Slot";
                }

                if (hasActiveSubscription) return "Subscribe later";

                return "Subscribe";
              })();

              /**
               * 5️⃣ Disable logic
               */
              const isDisabled =
                (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                hasReachedLimit;

              console.log(`🎯 Doctor ${doctorId} final state:`, {
                buttonText,
                isDisabled,
                canBookMore,
                hasReachedLimit,
              });

              return (
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    {/* Left Section - Doctor Details */}
                    <View style={styles.row}>
                      {/* <Image
                      source={{ uri: item.profilePhoto }}
                      style={styles.image}
                    /> */}
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("DoctorsInfoWithSubscription", {
                            doctors: item,
                          })
                        }
                      >
                        <Image
                          source={{ uri: item.profilePhoto }}
                          style={styles.image}
                        />
                      </TouchableOpacity>

                      <View style={styles.infoContainer}>
                        {/* <View style={styles.infoBox}> */}
                        <View style={styles.info}>
                          <Text style={styles.name}>{item.doctorname}</Text>
                          <View style={styles.specializedExpBox}>
                            <Text style={styles.specialization}>
                              {item.specialization}
                            </Text>
                            <Text style={styles.experience}>
                              {`${item.experience} exp`}
                            </Text>
                          </View>
                          <View style={styles.addressSection}>
                            <Text style={styles.addressText}>
                              {item.location}
                            </Text>
                          </View>
                          <View style={styles.reviewSection}></View>
                        </View>
                        <View style={styles.verifiedContainer}>
                          <Image
                            source={require("../../../assets/Images/Medical_Council_of_India_Logo.png")}
                            style={styles.imageBox}
                          />
                          <Text style={styles.verifiedBox}>
                            <Text style={styles.verified}>Verified</Text>
                            <Text style={styles.by}>by</Text>
                            <Text style={styles.mci}> MCI</Text>
                          </Text>
                        </View>
                        <View style={styles.subscriberCount}>
                          <View style={styles.countBox}>
                            <View
                              style={styles.heartButtonBox}
                              // onPress={() =>
                              //   handleHeartButtonPress(getDoctorKey(item))
                              // }
                            >
                              <Image
                                source={require("../../../assets/Icons/heart1.png")}
                                style={styles.heartImage}
                              />
                            </View>
                            <Text style={styles.numberText}>
                              {subscriberCounts[normalizeDoctorId(item)] || 0}
                            </Text>
                          </View>
                          <Text style={styles.subscriberCountText}>
                            Subscribers
                          </Text>
                        </View>
                        {/* </View> */}
                        {/* <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>
                          {item.description}
                        </Text>
                      </View> */}
                      </View>
                    </View>

                    {/* Right Section - Slot Booking */}
                    <View style={styles.subscriptionSection}>
                      <View style={styles.subscriptionTextBox}>
                        {/* <Text style={styles.priceText}>₹1999</Text> */}
                        <Text style={styles.feeText}> Subscribe Here</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.button,
                          isDisabled && { backgroundColor: "#B0B0B0" },
                        ]}
                        disabled={isDisabled}
                        // onPress={() => {
                        //   if (canBookMore) {
                        //     navigation.navigate("DoctorsInfoWithBooking", {
                        //       doctors: item,
                        //     });
                        //   }
                        // }}

                        // onPress={() => {
                        //   // 1️⃣ User has active subscription for this doctor and can book
                        //   if (canBookMore) {
                        //     navigation.navigate("DoctorsInfoWithBooking", {
                        //       doctors: item,
                        //     });
                        //     return;
                        //   }

                        //   // 2️⃣ User does NOT have subscription → go to subscribe screen
                        //   // if (
                        //   //   !hasActiveSubscription ||
                        //   //   !isSubscribedToThisDoctor
                        //   // ) {
                        //   //   navigation.navigate("DoctorsInfoWithSubscription", {
                        //   //     doctors: item,
                        //   //   });
                        //   // }
                        //   if (!hasActiveSubscription) {
                        //     navigation.navigate("DoctorsInfoWithSubscription", {
                        //       doctors: item,
                        //     });
                        //   }
                        // }}

                        onPress={() => {
                          if (canBookMore) {
                            navigation.navigate("DoctorsInfoWithBooking", {
                              doctors: item,
                            });
                            return;
                          }

                          if (!hasActiveSubscription) {
                            navigation.navigate("DoctorsInfoWithSubscription", {
                              doctors: item,
                            });
                          }
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: "#FFFFFF" }}>
                          {buttonText}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={doctorsToShow}
              keyExtractor={(item, index) => item.email || index.toString()}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
              renderItem={({ item }) => {
                // const doctorId = normalizeDoctorId(item);
                // const subscription = activeSubscriptionDoctorId;

                // const hasActiveSubscription =
                //   subscription &&
                //   subscription.doctorId &&
                //   (!subscription.expiry ||
                //     new Date(subscription.expiry) > new Date());

                // const isSubscribedToThisDoctor =
                //   hasActiveSubscription && subscription.doctorId === doctorId;

                // const totalAllowed = subscription?.total ?? 0;
                // const bookedCount = bookedCountByDoctor[doctorId] || 0;

                // const hasReachedLimit = bookedCount >= totalAllowed;

                // const canBookMore =
                //   isSubscribedToThisDoctor && !hasReachedLimit;
                // const buttonText = (() => {
                //   if (isSubscribedToThisDoctor) {
                //     if (hasReachedLimit) return "Booked";
                //     return "Book Slot";
                //   }

                //   if (hasActiveSubscription) return "Subscribe later";

                //   return "Subscribe";
                // })();

                // const isDisabled =
                //   // Other doctors blocked when subscription exists
                //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                //   // Block only when limit reached
                //   (isSubscribedToThisDoctor && hasReachedLimit);

                // const doctorId = normalizeDoctorId(item);
                // const subscription = activeSubscriptionDoctorId;

                // /**
                //  * 1️⃣ Subscription validity
                //  */
                // // const hasActiveSubscription =
                // //   subscription &&
                // //   subscription.doctorId &&
                // //   (!subscription.expiry ||
                // //     new Date(subscription.expiry) > new Date());

                // const hasActiveSubscription =
                //   subscription &&
                //   subscription.doctorId &&
                //   (subscription.expiry ||
                //     new Date(subscription.expiry) > new Date());

                // const isSubscribedToThisDoctor =
                //   hasActiveSubscription && subscription.doctorId === doctorId;

                // /**
                //  * 2️⃣ Booking counts
                //  */
                // const totalAllowed = Number(subscription?.total ?? 0);
                // const used = Number(subscription?.used ?? 0);

                // /**
                //  * 3️⃣ Guard: only evaluate limit if subscribed
                //  */
                // // const hasLimit = isSubscribedToThisDoctor && totalAllowed > 0;
                // // const hasReachedLimit = hasLimit && bookedCount >= totalAllowed;

                // // const canBookMore =
                // //   isSubscribedToThisDoctor && hasLimit && !hasReachedLimit;
                // const hasReachedLimit =
                //   isSubscribedToThisDoctor &&
                //   totalAllowed > 0 &&
                //   used >= totalAllowed;

                // const canBookMore =
                //   isSubscribedToThisDoctor && !hasReachedLimit;

                // /**
                //  * 5️⃣ Button text
                //  */
                // // const buttonText = (() => {
                // //   if (isSubscribedToThisDoctor) {
                // //     if (hasReachedLimit) return "Booked";
                // //     return "Book Slot";
                // //   }

                // //   if (hasActiveSubscription) return "Subscribe later";

                // //   return "Subscribe";
                // // })();

                // const buttonText = (() => {
                //   if (isSubscribedToThisDoctor) {
                //     return hasReachedLimit ? "Booked" : "Book Slot";
                //   }

                //   if (hasActiveSubscription) return "Subscribe later";

                //   return "Subscribe";
                // })();

                // /**
                //  * 6️⃣ Disable logic
                //  */
                // // const isDisabled =
                // //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                // //   (isSubscribedToThisDoctor && hasReachedLimit);
                // const isDisabled =
                //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                //   hasReachedLimit;

                // Replace the mobile view's subscription validation (around line 780-800)

                // const doctorId = normalizeDoctorId(item);
                // const subscription = activeSubscriptionDoctorId;

                // /**
                //  * 1️⃣ Subscription validity - FIXED
                //  */
                // const hasActiveSubscription =
                //   subscription &&
                //   subscription.doctorId &&
                //   (!subscription.expiry ||
                //     new Date(subscription.expiry) > new Date());

                // const isSubscribedToThisDoctor =
                //   hasActiveSubscription && subscription.doctorId === doctorId;

                // /**
                //  * 2️⃣ Booking counts - Using API's "used" field
                //  */
                // const totalAllowed = Number(subscription?.total ?? 0);
                // const used = Number(subscription?.used ?? 0);

                // /**
                //  * 3️⃣ Check if limit reached
                //  */
                // const hasReachedLimit =
                //   isSubscribedToThisDoctor &&
                //   totalAllowed > 0 &&
                //   used >= totalAllowed;

                // const canBookMore =
                //   isSubscribedToThisDoctor && !hasReachedLimit;

                // /**
                //  * 4️⃣ Button text
                //  */
                // const buttonText = (() => {
                //   if (isSubscribedToThisDoctor) {
                //     return hasReachedLimit ? "Booked" : "Book Slot";
                //   }
                //   if (hasActiveSubscription) return "Subscribe later";
                //   return "Subscribe";
                // })();

                // /**
                //  * 5️⃣ Disable logic
                //  */
                // const isDisabled =
                //   (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                //   hasReachedLimit;

                const doctorId = normalizeDoctorId(item);
                const subscription = activeSubscriptionDoctorId;

                console.log(`🔍 Checking doctor ${doctorId}:`, {
                  subscription,
                  bookedCount: bookedCountByDoctor[doctorId],
                });

                /**
                 * 1️⃣ Check if subscription is valid
                 */
                const hasActiveSubscription =
                  subscription &&
                  subscription.doctorId &&
                  (!subscription.expiry ||
                    new Date(subscription.expiry) > new Date());

                const isSubscribedToThisDoctor =
                  hasActiveSubscription && subscription.doctorId === doctorId;

                /**
                 * 2️⃣ Get consultation limits
                 */
                // ⚠️ CRITICAL FIX: If total is 0, use default plan value (usually 3)
                const DEFAULT_CONSULTATIONS = 3; // Change this to match your plan
                const totalAllowed =
                  Number(subscription?.total ?? 0) || DEFAULT_CONSULTATIONS;
                const usedFromAPI = Number(subscription?.used ?? 0);

                // Also check local booked count as backup
                const bookedCount = bookedCountByDoctor[doctorId] || 0;

                // Use the MAXIMUM of API "used" or local count to be safe
                const actualUsed = Math.max(usedFromAPI, bookedCount);

                const remainingSlots = totalAllowed - actualUsed;

                console.log(`📊 Doctor ${doctorId} slots:`, {
                  total: totalAllowed,
                  usedFromAPI,
                  bookedCount,
                  actualUsed,
                  remaining: remainingSlots,
                });

                /**
                 * 3️⃣ Determine if limit reached
                 */
                const hasReachedLimit =
                  isSubscribedToThisDoctor &&
                  totalAllowed > 0 &&
                  actualUsed >= totalAllowed;

                const canBookMore =
                  isSubscribedToThisDoctor && remainingSlots > 0;

                /**
                 * 4️⃣ Button text with remaining slots
                 */
                const buttonText = (() => {
                  if (isSubscribedToThisDoctor) {
                    if (hasReachedLimit) {
                      return "Booked";
                    }
                    // Show remaining slots
                    return remainingSlots > 1
                      ? `Book Slot (${remainingSlots} left)`
                      : "Book Slot";
                  }

                  if (hasActiveSubscription) return "Subscribe later";

                  return "Subscribe";
                })();

                /**
                 * 5️⃣ Disable logic
                 */
                const isDisabled =
                  (hasActiveSubscription && !isSubscribedToThisDoctor) ||
                  hasReachedLimit;

                console.log(`🎯 Doctor ${doctorId} final state:`, {
                  buttonText,
                  isDisabled,
                  canBookMore,
                  hasReachedLimit,
                });

                return (
                  <View style={styles.cardContainer}>
                    <View style={styles.cardBox}>
                      <View style={styles.cardHeaderInfo}>
                        <TouchableOpacity
                          style={styles.imageContainer}
                          onPress={() =>
                            navigation.navigate("DoctorsInfoWithSubscription", {
                              doctors: item,
                            })
                          }
                        >
                          <Image
                            source={{ uri: item.profilePhoto }}
                            style={styles.image}
                          />
                        </TouchableOpacity>

                        <View style={styles.doctorDetails}>
                          <Text style={styles.name}>{item.doctorname}</Text>
                          <View style={styles.specializationBox}>
                            <View style={styles.specializationTextBox}>
                              <Text style={styles.specialization}>
                                {item.specialization}
                              </Text>
                              <Text style={styles.locationText}>
                                {item.location}
                              </Text>
                            </View>
                            <View style={styles.verifiedByMCI}>
                              <Image
                                source={require("../../../assets/Images/Medical_Council_of_India_Logo.png")}
                                style={styles.imageMCI}
                              />
                              <Text style={styles.verifiedBox}>
                                <Text style={styles.mobileVerified}>
                                  Verified
                                </Text>
                                <Text style={styles.mobileBy}>by</Text>
                                <Text style={styles.mobileMCI}>MCI</Text>
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.rightContainer}>
                          <View style={styles.countBox}>
                            <View style={styles.heartButtonBox}>
                              <Image
                                source={require("../../../assets/Icons/heart1.png")}
                                style={styles.heartImage}
                              />
                            </View>
                            <Text style={styles.numberText}>
                              {subscriberCounts[normalizeDoctorId(item)] || 0}
                            </Text>
                          </View>
                          <View style={styles.rating}>
                            <Image
                              source={require("../../../assets/Icons/Star.png")}
                              style={styles.starIcon}
                            />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.secondSection}>
                        <View style={styles.doctorInfo}>
                          <View style={styles.aboutDoc}>
                            <Text style={styles.aboutDocText}>About Doc</Text>
                            <View style={styles.descriptionContainer}>
                              <Text
                                style={styles.description}
                                numberOfLines={showFull ? null : 2}
                                ellipsizeMode="tail"
                              >
                                Specialized in {item.specialization}, with a
                                experience of {item.experience}.
                              </Text>

                              <TouchableOpacity
                                onPress={() => setShowFull(!showFull)}
                              >
                                <Text style={styles.knowMore}>
                                  {showFull ? "Show less" : "Know more"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={styles.verticalLine} />
                          <View style={styles.docFees}>
                            <Text style={styles.docFeesText}>
                              Subscription Fees
                            </Text>
                            <Text style={styles.feesText}>
                              499 / for 3 days
                              {/* {item.consultationFees || `₹${item.fees || 0}`} */}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.button,
                            isDisabled && { backgroundColor: "#B0B0B0" },
                          ]}
                          disabled={isDisabled}
                          // onPress={() => {
                          //   // 1️⃣ User has active subscription for this doctor and can book
                          //   if (canBookMore) {
                          //     navigation.navigate("DoctorsInfoWithBooking", {
                          //       doctors: item,
                          //     });
                          //     return;
                          //   }

                          //   if (!hasActiveSubscription) {
                          //     navigation.navigate(
                          //       "DoctorsInfoWithSubscription",
                          //       {
                          //         doctors: item,
                          //       }
                          //     );
                          //   }
                          // }}
                          onPress={() => {
                            if (canBookMore) {
                              navigation.navigate("DoctorsInfoWithBooking", {
                                doctors: item,
                              });
                              return;
                            }

                            if (!hasActiveSubscription) {
                              navigation.navigate(
                                "DoctorsInfoWithSubscription",
                                {
                                  doctors: item,
                                }
                              );
                            }
                          }}
                        >
                          <Text style={{ fontWeight: "600", color: "#FFFFFF" }}>
                            {buttonText}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    Width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 10,
    flexDirection: "column",
  },
  //App design Start

  appContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  cardContainer: {
    height: 195,
    width: "99%",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 14,
    backgroundColor: "#fff",
    alignSelf: "center",
    boxShadow: " 0px 0px 4px 1px rgba(17, 16, 16, 0.25)",
    padding: "0.5%",
    borderColor: "#dcdcdc",
    ...Platform.select({
      web: {
        height: windowWidth > 1000 ? 195 : 308,
      },
    }),
  },
  cardBox: {
    flexDirection: "column",
    ...Platform.select({
      web: {
        flexDirection: "column",
      },
    }),
  },
  cardHeaderInfo: {
    height: "37%",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    ...Platform.select({
      web: {
        height: "34%",
        //borderWidth:1
      },
    }),
  },
  doctorImage: {
    height: 47,
    width: 57,
    borderRadius: 40,
    marginVertical: "1%",
  },
  doctorDetails: {
    height: "100%",
    width: "56%",
    //borderWidth: 1,
    alignSelf: "center",
    marginRight: "11%",
    paddingLeft: "1%",
    ...Platform.select({
      web: {
        //borderWidth:1,
        height: "82%",
      },
    }),
  },

  rating: {
    height: "30%",
    width: "47%",
    //borderWidth: 1,
    marginVertical: "3%",
    borderRadius: 7,
    boxShadow: " 0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginRight: "20%",
  },
  starIcon: {
    height: 13,
    width: 13,
    alignSelf: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 400,
    alignSelf: "center",
  },
  secondSection: {
    height: "61%",
    width: "90%",
    //borderWidth: 1,
    alignSelf: "center",
    backgroundColor: " rgb(244, 243, 243)",
    borderRadius: 10,
    padding: "2%",
    marginVertical: "0.5%",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px;",
    ...Platform.select({
      web: {
        width: "90%",
        height: windowWidth > 1000 ? "40%" : "70%",
        bottom: windowWidth > 1000 ? "10%" : "0%",
        marginTop: windowWidth > 1000 ? "0%" : "3%",
        // marginTop: "0%",
        borderWidth: windowWidth > 1000 ? 1 : 0,
        padding: windowWidth > 1000 ? "0%" : "5%",
      },
    }),
  },
  doctorInfo: {
    height: "71%",
    width: "100%",
    //borderWidth: 1,
    alignSelf: "center",
    flexDirection: "row",
    paddingHorizontal: "2%",
  },
  aboutDoc: {
    height: "104%",
    width: "50%",
    //borderWidth: 1,
    flexDirection: "column",
    ...Platform.select({
      web: {
        flexDirection: "column",
        padding: "1%",
        //borderWidth:1,
        height: "104%",
      },
    }),
  },
  aboutDocText: {
    fontSize: 13,
    fontWeight: 500,
  },
  aboutDocDetails: {
    fontSize: 10,
    fontWeight: 400,
  },

  docFees: {
    height: "100%",
    width: "50%",
    //borderWidth: 1,
  },
  docFeesText: {
    paddingHorizontal: "5%",
    fontSize: 13,
    fontWeight: 500,
  },
  feesText: {
    fontSize: 13,
    fontWeight: 400,
    color: " rgb(62, 145, 229)",
    paddingHorizontal: "5%",
    paddingVertical: "5%",
  },
  verticalLine: {
    height: "90%",
    width: "0.7%",
    //borderWidth:1,
    alignSelf: "center",
    backgroundColor: "rgba(56, 55, 55, 0.12)",
  },
  //App style end

  card: {
    ...Platform.select({
      web: {
        marginBottom: "0.5%",
        paddingVertical: "0.5%",
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "#000000",
        height: "97%",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        backgroundColor: "#FFFFFF",
        width: "98%",
        alignSelf: "center",
      },
    }),
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //borderWidth: 1,
    height: "100%",
    borderColor: "red",
    padding: "0.3%",
  },
  row: {
    flexDirection: "row",
    //alignItems: "center",
    //borderWidth: 1,
    borderColor: "#000000",
    width: "80%",
    height: "100%",
    //marginHorizontal: "1%",
    padding: "0.4%",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "17%",
    height: "89%",
    //borderWidth: 1,
    marginHorizontal: "1%",
    ...Platform.select({
      web: {
        width: "21%",
        height: "65%",
        //borderWidth: 1,
        marginHorizontal: "1%",
      },
    }),
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginHorizontal: "1%",
    ...Platform.select({
      web: {
        width: 70,
        height: 70,
        borderRadius: 50,
      },
    }),
  },
  infoContainer: {
    //flex: 1,
    //borderWidth: 2,
    borderColor: "#000000",
    width: "91%",
    //borderColor: "blue",
    padding: "0.5%",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  info: {
    //borderWidth: 1,
    borderColor: "#000000",
    width: "56%",
    height: "100%",
  },

  name: {
    fontSize: 15,
    fontWeight: 600,
    ...Platform.select({
      web: {
        fontSize: 16,
        fontWeight: 600,
      },
    }),
  },
  specializedExpBox: {
    height: "25%",
    width: "100%",
    //borderWidth: 1,
    borderColor: "red",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  specializationBox: {
    //borderWidth: 1,
    height: "68%",
    flexDirection: "row",
  },
  specializationTextBox: {
    //borderWidth: 1,
    width: "60%",
    height: "100%",
    borderColor: "#adff2f",
    flexDirection: "column",
    ...Platform.select({
      web: {
        width: windowWidth > 1000 ? "60%" : "65%",
      },
    }),
  },
  specialization: {
    fontSize: 12,
    fontWeight: 600,
    color: "#000",
    ...Platform.select({
      web: {
        fontSize: 13,
        fontWeight: 500,
        color: "#444444",
      },
    }),
  },
  locationText: {
    fontSize: 11,
    fontWeight: 400,
    color: "#444444",
  },
  experience: {
    fontSize: 13,
    fontWeight: 500,
    color: "#444444",
    marginRight: "15%",
  },
  addressSection: {
    height: "28%",
    width: "100%",
    //borderWidth: 1,
    marginTop: "2%",
  },
  addressText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#rgba(136, 136, 136, 1)",
  },
  reviewSection: {
    height: "20%",
    width: "30%",
    //borderWidth: 1,
  },
  verifiedByMCI: {
    //borderWidth: 1,
    width: "40%",
    height: "40%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imageMCI: {
    height: 10,
    width: 10,
    marginVertical: "3%",
    marginHorizontal: "2%",
  },

  verifiedContainer: {
    width: "20%",
    flexDirection: "row",
    //borderWidth: 1,
    borderColor: "purple",
    paddingVertical: "0.5%",
    justifyContent: "space-around",
  },
  imageBox: {
    height: 21,
    width: 21,
  },
  verifiedBox: {
    //borderWidth: 1,
    height: "80%",
    width: "70%",
    justifyContent: "space-evenly",
    alignSelf: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        flexDirection: "row",
        //borderWidth: 1,
        borderColor: "#000000",
        width: "70%",
        height: "25%",
        marginBottom: "39%",
      },
    }),
  },
  mobileVerified: {
    fontSize: 7,
    fontWeight: 300,
    color: "green",
    //alignSelf:"center"
  },
  mobileBy: {
    fontSize: 7,
    fontWeight: 300,
    //alignSelf:"center"
  },
  mobileMCI: {
    fontSize: 7,
    fontWeight: 300,
    color: "#FF7373",
    //alignSelf:"center"
  },
  verified: {
    fontSize: 12,
    color: "green",
    paddingVertical: "5%",
    paddingHorizontal: "3%",
    fontWeight: 300,
  },
  by: {
    fontSize: 12,
    fontWeight: 300,
  },
  mci: {
    color: "#FF7373",
    fontSize: 12,
    fontWeight: 300,
  },
  rightContainer: {
    //borderWidth: 1,
    width: "25%",
    right: "10%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  // subscribeRatingBox: {
  //   borderWidth: 1,
  //   width: "16%",
  //   flexDirection:"row",
  //   justifyContent:"space-around",
  //   marginRight:"8%"
  // },
  subscriberCount: {
    width: "15%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countBox: {
    //borderWidth: 1,
    borderColor: "blue",
    height: "75%",
    width: "45%",
    marginTop: "3%",
    ...Platform.select({
      web: {
        height: "100%",
        width: "30%",
        //borderWidth: 1,
        borderColor: "blue",
        alignSelf: "center",
        flexDirection: "column",
      },
    }),
  },
  heartButtonBox: {
    height: "33%",
    width: "79%",
    //borderWidth: 1,
    alignSelf: "center",
  },
  heartImage: {
    height: 22,
    width: 24.5,
    alignSelf: "center",
    ...Platform.select({
      web: {
        height: 17,
        width: 19,
        marginTop: "3%",
      },
    }),
  },
  numberText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#000000",
    alignSelf: "center",
  },
  subscriberCountText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
    marginVertical: "3.5%",
  },
  descriptionContainer: {
    height: "auto",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "column",
    ...Platform.select({
      web: {
        //borderWidth: 1,
        // borderColor: "#000000",
        width: "95%",
        flexDirection: "column",
        //justifyContent: "space-around",
      },
    }),
  },
  description: {
    fontSize: 10,
    fontWeight: 500,
    color: "#000",
    ...Platform.select({
      web: {
        fontSize: 10,
        marginTop: "1%",
      },
    }),
  },
  knowMore: {
    alignSelf: "flex-end",
    fontSize: 11,
    fontWeight: 400,
    color: "#2C00D9",
    paddingRight: "2%",
    //marginBottom:"10%"
  },
  subscriptionSection: {
    //borderWidth: 1,
    borderColor: "#000",
    flexDirection: "column",
    marginRight: "2%",
    width: "17%",
    height: "100%",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    alignItems: "center",
  },
  subscriptionTextBox: {
    height: "20%",
    width: "95%",
    //borderWidth:1,
    marginTop: "17%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  priceText: {
    //fontFamily:"Annapurna SIL",
    fontSize: 16,
    fontWeight: 500,
    color: "#000000",
    marginLeft: "5%",
  },
  feeText: {
    fontSize: 16,
    fontWeight: 400,
    color: "#888888",
    marginRight: "8%",
  },
  button: {
    marginHorizontal: "3%",
    backgroundColor: "rgb(243, 119, 119)",
    height: "27%",
    width: "55%",
    borderRadius: 8,
    marginVertical: "2.2%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
    ...Platform.select({
      web: {
        marginHorizontal: "3%",
        backgroundColor: "#FF7373",
        height: "27%",
        width: "95%",
        borderRadius: 6,
        marginTop: "3%",
        justifyContent: "center",
        alignItems: "center",
      },
    }),
  },
  buttonText: {
    color: "#fff",
  },
  arrowIcon: {
    height: 11,
    width: 9,
    marginHorizontal: "5%",
  },
});

export default DoctorAppointmentScreen;
