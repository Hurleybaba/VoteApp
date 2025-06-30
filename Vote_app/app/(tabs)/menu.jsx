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
          "Cache-Control": "no-cache",
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

  // Add icon helpers for each row
  const rowIcons = {
    role: "person-circle-outline",
    verified: "shield-checkmark-outline",
    pending: "shield-outline",
    memberSince: "calendar-outline",
    verifiedSince: "checkmark-done-outline",
    name: "person-outline",
    username: "at-outline",
    age: "hourglass-outline",
    email: "mail-outline",
    phone: "call-outline",
    faculty: "school-outline",
    department: "business-outline",
    matric: "barcode-outline",
    level: "layers-outline",
    themes: "color-palette-outline",
    credits: "star-outline",
    contact: "chatbubble-ellipses-outline",
    licence: "document-text-outline",
    password: "lock-closed-outline",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral.gray[50] }}>
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
        {/* Profile Card */}
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
        {/* Account Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons
              name="person-circle-outline"
              size={22}
              color={COLORS.primary.default}
            />
            <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>
          </View>
          <View style={styles.settingContainer2}>
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.role}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Role</Text>
              <Text style={styles.right}>{user.role}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={kycVerified ? rowIcons.verified : rowIcons.pending}
                size={18}
                color={kycVerified ? "#10B981" : "#F59E0B"}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Verified</Text>
              <View style={styles.verificationStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: kycVerified ? "#10B981" : "#F59E0B" },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: kycVerified ? "#10B981" : "#F59E0B" },
                  ]}
                >
                  {kycVerified ? "Verified" : "Pending"}
                </Text>
                <Ionicons
                  name={kycVerified ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color={kycVerified ? COLORS.feedback.success : "#F59E0B"}
                />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.memberSince}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Member Since</Text>
              <Text style={styles.right}>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.verifiedSince}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Verified Since</Text>
              <Text style={styles.right}>
                {academicData.verified_at
                  ? new Date(academicData.verified_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
        {/* Personal Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons
              name="person-outline"
              size={22}
              color={COLORS.primary.default}
            />
            <Text style={styles.sectionHeader}>PERSONAL DETAILS</Text>
          </View>
          <View style={styles.settingContainer2}>
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.name}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Name</Text>
              <Text
                style={styles.right2}
              >{`${user.last_name} ${user.first_name} ${user.middle_name}`}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.username}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Username</Text>
              <Text style={styles.right}>{user.username}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.age}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Age</Text>
              <Text style={styles.right}>{user.age}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.email}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.right2}>{user.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.phone}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Phone Number</Text>
              <Text style={styles.right}>{user.phone}</Text>
            </View>
          </View>
        </View>
        {/* Academic Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons
              name="school-outline"
              size={22}
              color={COLORS.primary.default}
            />
            <Text style={styles.sectionHeader}>ACADEMIC DETAILS</Text>
          </View>
          <View style={styles.settingContainer2}>
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.faculty}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Faculty</Text>
              <Text style={styles.right2}>{academicData.faculty_name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.department}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Department</Text>
              <Text style={styles.right2}>{academicData.department}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.matric}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Matric No</Text>
              <Text style={styles.right}>{academicData.matric_no}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons
                name={rowIcons.level}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Level</Text>
              <Text style={styles.right2}>{academicData.level}</Text>
            </View>
          </View>
        </View>
        {/* General Section Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={COLORS.primary.default}
            />
            <Text style={styles.sectionHeader}>GENERAL</Text>
          </View>
          <View style={styles.settingContainer2}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Ionicons
                name={rowIcons.themes}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Themes</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Ionicons
                name={rowIcons.credits}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Credits</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Ionicons
                name={rowIcons.contact}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Contact</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Ionicons
                name={rowIcons.licence}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Licence & Agreement</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Ionicons
                name={rowIcons.password}
                size={18}
                color={COLORS.primary.default}
                style={styles.rowIcon}
              />
              <Text style={styles.settingLabel}>Change Password</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logUserOut()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.feedback.error, "#F87171"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutText}>Log out</Text>
          </LinearGradient>
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
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
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
    right: 4,
    bottom: 4,
    backgroundColor: COLORS.primary.default,
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
    ...SHADOWS.sm,
  },
  profileCard: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
    ...SHADOWS.md,
  },
  profileImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  profileCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  adminBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary.default,
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 18,
    marginHorizontal: 10,
    // marginBottom: SPACING.md,
    marginTop: 10,
    padding: 16,
    ...SHADOWS.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary.default,
    marginLeft: 4,
    letterSpacing: 1,
  },
  settingContainer2: {
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    marginTop: 2,
    marginBottom: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "space-between",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.neutral.gray[700],
    marginLeft: 8,
  },
  rowIcon: {
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: 24,
    borderRadius: 24,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 24,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
