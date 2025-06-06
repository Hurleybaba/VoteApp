import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import profileImage from "@/assets/images/download.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { baseUrl } from "../baseUrl";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";

const menu = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [academicData, setAcademicData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const collectAcademicData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/api/face/saa/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success || !response.data.userAcademicData) {
        console.log("No academic data found for user:", userId);
        return null;
      }

      // Check based on your backend response structure
      return response.data.userAcademicData;
    } catch (error) {
      console.error("Error checking academic data:", error);
      if (error.response?.status === 404) {
        console.log("Academic data not found for user");
        return null;
      }
      throw error;
    }
  };

  const checkLoginStatusAndFetchUser = async () => {
    setIsLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/index2");
      return;
    }

    const isUserVerified = await AsyncStorage.getItem("isUserVerified");

    setKycVerified(isUserVerified === "true");
    try {
      const response = await axios.get(`${baseUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Conrol": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        if (!response.data?.user) {
          throw new Error("Invalid user data structure");
        }
        setUser(response.data.user);

        const academicDataCollected = await collectAcademicData(
          response.data.user.userid
        );

        setAcademicData(academicDataCollected || {});
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setAcademicData({});
      setError(error.message);

      // Clear invalid token and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.multiRemove(["token", "isUserVerified"]);
        router.replace("/index2");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const logUserOut = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.warn("No token found, already logged out or never logged in.");
        await AsyncStorage.removeItem("token"); // Just in case it's still partially there
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );
      if (response.status === 200) {
        await AsyncStorage.removeItem("token");
        console.log("User successfully logged out from client-side.");
        router.replace("/index2");
      } else {
        throw new Error(response.data.message || "Error logging user out.");
      }
    } catch (error) {
      console.error(
        "Failed to log user out:",
        error.response ? error.response.data : error.message
      );
      await AsyncStorage.removeItem("token");
      router.replace("/index2");
      Alert.alert(
        "Logout Failed",
        error.response?.data?.message || "Could not log out. Please try again."
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkLoginStatusAndFetchUser();
  };

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

  if (isLoading || Object.keys(user).length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8612D" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={checkLoginStatusAndFetchUser}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E8612D"]}
            tintColor="#E8612D"
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      >
        <LinearGradient
          colors={["#E8612D", "#FAB09B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.circle}
            onPress={() => router.push("/kyc/upload")}
          >
            <Image
              source={user.profile_id ? { uri: user.profile_id } : profileImage}
              style={styles.profile}
              defaultSource={profileImage}
            />
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={24} color={COLORS.neutral.white} />
            </View>
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{`${capitalize(
              user.first_name
            )} ${capitalize(user.last_name)}`}</Text>
            {!kycVerified ? (
              <Ionicons
                name="shield-outline"
                size={22}
                color={COLORS.feedback.warning}
              />
            ) : (
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={COLORS.feedback.success}
              />
            )}
          </View>
        </LinearGradient>

        <View style={styles.parent}>
          <Text style={styles.subtopic}>ACCOUNT INFORMATION</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Role</Text>

              <Text style={styles.right}>{user.role}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Verified</Text>

              {kycVerified ? (
                <View style={styles.verificationStatus}>
                  <View
                    style={[styles.statusDot, { backgroundColor: "#10B981" }]}
                  />
                  <Text style={[styles.statusText, { color: "#10B981" }]}>
                    Verified
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.feedback.success}
                  />
                </View>
              ) : (
                <View style={styles.verificationStatus}>
                  <View
                    style={[styles.statusDot, { backgroundColor: "#F59E0B" }]}
                  />
                  <Text style={[styles.statusText, { color: "#F59E0B" }]}>
                    Pending
                  </Text>
                  <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                </View>
              )}
            </View>
            <View style={styles.setting}>
              <Text>Member Since</Text>

              <Text style={styles.right}>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Verified Since</Text>

              <Text style={styles.right}>
                {academicData.verified_at
                  ? new Date(academicData.verified_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>PERSONAL DETAILS</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Name</Text>
              <Text
                style={styles.right2}
              >{`${user.last_name} ${user.first_name} ${user.middle_name}`}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Username</Text>
              <Text style={styles.right}>{user.username}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Age</Text>
              <Text style={styles.right}>{user.age}</Text>
            </View>

            <View style={styles.setting}>
              <Text>Email</Text>
              <Text style={styles.right2}>{user.email}</Text>
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Phone Number</Text>
              <Text style={styles.right}>{user.phone}</Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>ACADEMIC DETAILS</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Faculty</Text>
              <Text style={styles.right2}>{academicData.faculty_name}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Department</Text>
              <Text style={styles.right2}>{academicData.department}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Matric No</Text>
              <Text style={styles.right}>{academicData.matric_no}</Text>
            </View>

            <View style={[styles.setting, styles.setting2]}>
              <Text>Level</Text>
              <Text style={styles.right2}>{academicData.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>GENERAL</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Themes</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Credits</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Contact</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Licence & Agreement</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Change Password</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.parent} onPress={() => logUserOut()}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default menu;

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.neutral.white,
    marginBottom: SPACING.md,
    // overflow: "hidden",
    ...SHADOWS.md,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    position: "relative",
  },
  profile: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
  nameContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    padding: 12,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  unverifiedBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  verifiedText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  unverifiedText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "500",
  },
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  parent: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  subtopic: {
    color: "grey",
    fontSize: 14,
    marginBottom: 6,
  },
  settingContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    borderColor: "#b4b4b4",
    backgroundColor: "#dcdcdc",
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#b4b4b4",
  },
  setting2: {
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  text: {
    fontSize: 18,
  },
  lefty: {
    fontWeight: 600,
    fontsize: 18,
  },
  right: {
    textTransform: "uppercase",
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral.gray[600],
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  right2: {
    textTransform: "capitalize",
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral.gray[600],
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: "right",
  },
  logout: {
    color: "red",
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: `${COLORS.feedback.error}20`,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.feedback.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary.default,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  retryText: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  editOverlay: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: COLORS.primary.default,
    borderRadius: BORDER_RADIUS.full,
    padding: 8,
    zIndex: 5,
    ...SHADOWS.sm,
  },
});
