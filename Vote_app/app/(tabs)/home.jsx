import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import image from "@/assets/images/download.jpg";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../baseUrl";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState({});
  const [hasAcademicData, setHasAcademicData] = useState(false);
  const [posts, setPosts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const scaleAnimation = useState(new Animated.Value(1))[0];
  const menuAnimation = useState(new Animated.Value(0))[0];
  const [showImageModal, setShowImageModal] = useState(false);

  const checkFaceData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/api/face/saa/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Academic data response:", response.data);

      // Check based on your backend response structure
      if (response.data.success && response.data.userAcademicData) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking academic data:", error);

      // Handle specific error types from backend
      if (error.response?.data?.errorType) {
        switch (error.response.data.errorType) {
          case "MISSING_USERID":
            console.log("User ID is missing");
            break;
          case "USER_NOT_FOUND":
            console.log("User not found in database");
            break;
          case "NO_ACADEMIC_DATA":
            console.log("No academic data found for user");
            return false;
          case "DATABASE_ERROR":
            console.log(
              "Database error occurred:",
              error.response.data.message
            );
            break;
          case "SERVER_ERROR":
            console.log("Server error occurred:", error.response.data.message);
            break;
          default:
            console.log("Unknown error type:", error.response.data.errorType);
        }
      }

      // Handle HTTP status codes
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.log("Session expired or unauthorized");
          await AsyncStorage.multiRemove(["token", "isUserVerified"]);
          router.replace("/index2");
          return false;
        }

        if (error.response.status === 404) {
          console.log("Resource not found");
          return false;
        }
      } else if (error.request) {
        console.log("No response received from server");
      } else {
        console.log("Error setting up request:", error.message);
      }

      // Return false for any error case
      return false;
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

        const isVerified = Boolean(response.data.verified);
        setKycVerified(isVerified);
        await AsyncStorage.setItem("isUserVerified", isVerified.toString());

        if (!isVerified) {
          try {
            const academicDataExists = await checkFaceData(
              response.data.user.userid
            );
            setHasAcademicData(academicDataExists);
          } catch (academicError) {
            console.error("Error checking academic data:", academicError);
            setHasAcademicData(false);
          }
        }

        await getElections(token);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
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

  const getElections = async (token) => {
    try {
      const response = await axios.get(`${baseUrl}/api/election`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        // Merge general and faculty elections
        const facultyPosts = response.data.facultyPosts || [];
        const generalPosts = response.data.posts || [];
        const allElections = [...generalPosts, ...facultyPosts];
        setPosts(allElections);
      } else {
        throw new Error("Failed to fetch the news data");
      }
    } catch (error) {
      console.error("Failed error:", error);
      setError(error.message);

      // Clear invalid token and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.removeItem("token");
        router.replace("/index2");
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkLoginStatusAndFetchUser();
  };

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

  // console.log(user);
  console.log("User ID:", user?.userid);

  // Helper to get election type label and color
  const getElectionType = (election) => {
    if (election.faculty_id === 2500 || election.faculty_name === "General") {
      return { label: "General", color: COLORS.primary.default };
    }
    return {
      label: election.faculty_name || "Faculty",
      color: COLORS.secondary.default,
    };
  };

  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "#10B981"; // green
      case "upcoming":
        return "#F59E0B"; // orange
      case "ended":
        return "#6B7280"; // gray
      default:
        return COLORS.primary.default;
    }
  };

  const ElectionCard = ({
    title,
    duration,
    status,
    election_id,
    faculty_name,
    faculty_id,
    start_date,
  }) => {
    const { label: typeLabel, color: typeColor } = getElectionType({
      faculty_id,
      faculty_name,
    });
    const handleElectionPress = () => {
      if (status === "ongoing") {
        router.push({
          pathname: `/(election)/${election_id}/indexx`,
          params: { electionId: election_id },
        });
      } else if (status === "ended") {
        router.push({
          pathname: `/(election)/${election_id}/ended`,
          params: { electionId: election_id },
        });
      } else {
        router.push({
          pathname: `/(election)/${election_id}/upcoming`,
          params: { electionId: election_id },
        });
      }
    };
    return (
      <TouchableOpacity
        onPress={handleElectionPress}
        style={styles.electionCard}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(status) },
              ]}
            >
              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.cardMetaRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.neutral.gray[600]}
            />
            <Text style={styles.duration}>
              {start_date
                ? new Date(start_date.replace(" ", "T")).toLocaleDateString()
                : duration}
            </Text>
            <View
              style={[styles.typeBadge, { backgroundColor: typeColor + "22" }]}
            >
              <Ionicons
                name={
                  typeLabel === "General" ? "globe-outline" : "school-outline"
                }
                size={14}
                color={typeColor}
              />
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                {typeLabel}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, onSeeMore }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeMore && (
        <TouchableOpacity onPress={onSeeMore} style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See more</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={COLORS.primary.default}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading || Object.keys(user).length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.default} />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle"
            size={56}
            color={COLORS.primary.default}
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={checkLoginStatusAndFetchUser}
            style={styles.retryButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={COLORS.neutral.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleKYCRedirect = () => {
    if (!user?.userid) {
      Alert.alert("Error", "User data not loaded yet");
      return;
    }

    router.push({
      pathname: `/[kyc]/kycpg${hasAcademicData ? "2" : "1"}`,
      params: {
        kyc: "kyc",
        userid: user.userid,
      },
    });
  };

  const animateMenu = (show) => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: show ? 0.9 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(menuAnimation, {
        toValue: show ? 1 : 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleAdminMenu = () => {
    const newState = !showAdminMenu;
    setShowAdminMenu(newState);
    animateMenu(newState);
  };

  const handleMenuItemPress = (route) => {
    toggleAdminMenu();
    setTimeout(() => router.push(route), 300);
  };

  const renderAdminMenu = () => {
    const translateY = menuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    });

    const opacity = menuAnimation;

    if (user?.role !== "admin") return null;

    return (
      <View style={[styles.adminContainer, { bottom: insets.bottom + 70 }]}>
        <Animated.View
          style={[
            styles.adminMenuContainer,
            {
              opacity,
              transform: [{ translateY }],
              pointerEvents: showAdminMenu ? "auto" : "none",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("/(admin)/election")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.primary.light, COLORS.primary.default]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuIconBg}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={COLORS.neutral.white}
              />
            </LinearGradient>
            <Text style={styles.menuItemText}>Create Election</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("/(admin)/candidates")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.primary.light, COLORS.primary.default]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuIconBg}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={COLORS.neutral.white}
              />
            </LinearGradient>
            <Text style={styles.menuItemText}>Register Candidates</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.fab,
            {
              transform: [
                { scale: scaleAnimation },
                {
                  rotate: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "45deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={toggleAdminMenu} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.primary.light, COLORS.primary.default]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={24} color={COLORS.neutral.white} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {showAdminMenu && (
          <TouchableWithoutFeedback onPress={toggleAdminMenu}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  };

  const handleProfilePress = () => {
    setShowImageModal(true);
  };

  const renderImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageModal(false)}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={28} color={COLORS.neutral.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          {user.profile_id ? (
            <Image
              source={{ uri: user.profile_id }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={image}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View
          style={[
            styles.modalFooter,
            { paddingBottom: insets.bottom + SPACING.lg },
          ]}
        >
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowImageModal(false);
              router.push("/(kyc)/upload");
            }}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={COLORS.neutral.white}
            />
            <Text style={styles.modalButtonText}>Edit Profile Picture</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.default]}
            tintColor={COLORS.primary.default}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={handleProfilePress}>
              <Image
                source={user.profile_id ? { uri: user.profile_id } : image}
                style={styles.profileImage}
                defaultSource={image}
              />
              {user.role === "admin" && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.username}>{capitalize(user.username)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.neutral.gray[700]}
            />
          </TouchableOpacity>
        </View>

        {/* KYC Banner */}
        {!kycVerified && (
          <TouchableOpacity
            onPress={handleKYCRedirect}
            style={styles.kycBannerWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary.light, COLORS.primary.default]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.kycBanner}
            >
              <View style={styles.kycContent}>
                <View>
                  <Text style={styles.kycTitle}>Complete Your KYC</Text>
                  <Text style={styles.kycSubtitle}>
                    Verify your identity to start voting
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.kycButton}
                  onPress={handleKYCRedirect}
                >
                  <Ionicons
                    name="checkmark-done-circle"
                    size={28}
                    color={COLORS.primary.default}
                  />
                  <Text style={styles.kycButtonText}>Start KYC</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Elections Sections */}
        {kycVerified ? (
          <>
            {/* Ongoing/Upcoming Elections Section */}
            <SectionHeader title="Ongoing/Upcoming Elections" />
            <View style={styles.electionsContainer}>
              {Object.values(posts).filter(
                (election) =>
                  election.status === "ongoing" ||
                  election.status === "upcoming"
              ).length > 0 ? (
                Object.values(posts)
                  .filter(
                    (election) =>
                      election.status === "ongoing" ||
                      election.status === "upcoming"
                  )
                  .map((election, index) => (
                    <ElectionCard
                      key={`active-${election.election_id || index}`}
                      title={election.election_name || "Election Title"}
                      duration={election.duration}
                      status={election.status}
                      election_id={election.election_id}
                      faculty_name={election.faculty_name}
                      faculty_id={election.faculty_id}
                      start_date={election.start_date}
                    />
                  ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color={COLORS.neutral.gray[400]}
                  />
                  <Text style={styles.emptyStateText}>
                    No active or upcoming elections
                  </Text>
                </View>
              )}
            </View>
            {/* Recent Elections Section */}
            <SectionHeader title="Recent Elections" />
            <View style={styles.electionsContainer}>
              {Object.values(posts).filter(
                (election) => election.status === "ended"
              ).length > 0 ? (
                Object.values(posts)
                  .filter((election) => election.status === "ended")
                  .map((election, index) => (
                    <ElectionCard
                      key={`ended-${election.election_id || index}`}
                      title={election.election_name || "Election Title"}
                      duration={election.duration}
                      status={election.status}
                      election_id={election.election_id}
                      faculty_name={election.faculty_name}
                      faculty_id={election.faculty_id}
                      start_date={election.start_date}
                    />
                  ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons
                    name="time-outline"
                    size={40}
                    color={COLORS.neutral.gray[400]}
                  />
                  <Text style={styles.emptyStateText}>
                    No completed elections yet
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.nonVerifiedContainer}>
            <Ionicons
              name="lock-closed"
              size={48}
              color={COLORS.neutral.gray[400]}
            />
            <Text style={styles.nonVerifiedText}>
              Complete KYC verification to view elections
            </Text>
          </View>
        )}
      </ScrollView>
      {renderAdminMenu()}
      {renderImageModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary.light,
  },
  editOverlay: {
    position: "absolute",
    right: -5,
    bottom: -5,
    backgroundColor: COLORS.primary.default,
    borderRadius: BORDER_RADIUS.full,
    padding: 5,
    ...SHADOWS.sm,
  },
  welcomeContainer: {
    marginLeft: SPACING.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.gray[600],
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary.default,
  },
  notificationButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.neutral.gray[100],
    borderRadius: BORDER_RADIUS.full,
  },
  kycBanner: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  kycContent: {
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.md,
  },
  kycTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  kycSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary.default,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  seeMoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary.default,
  },
  electionsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  electionCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.neutral.gray[200],
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary.default,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  duration: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.gray[600],
  },
  nonVerifiedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    marginTop: SPACING["2xl"],
  },
  nonVerifiedText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.neutral.gray[600],
    textAlign: "center",
    marginTop: SPACING.md,
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
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryText: {
    color: "#E8612D",
    fontWeight: "bold",
  },
  retryButton: {
    color: "#E8612D",
    fontWeight: "bold",
  },
  adminContainer: {
    position: "absolute",
    right: SPACING.xl,
    alignItems: "flex-end",
    zIndex: 100,
  },
  adminMenuContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
    width: 220,
    ...SHADOWS.lg,
    elevation: 5,
    zIndex: 102,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary.default,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.neutral.gray[200],
    marginHorizontal: SPACING.xs,
  },
  fab: {
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
    zIndex: 102,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.primary.default,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 101,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.neutral.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.gray[200],
    borderStyle: "dashed",
    marginVertical: SPACING.sm,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral.gray[600],
    marginTop: SPACING.sm,
  },
  emptyStateSubText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.gray[500],
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "space-between",
  },
  modalHeader: {
    paddingHorizontal: SPACING.lg,
    alignItems: "flex-end",
  },
  closeIconButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  modalImage: {
    width: "100%",
    height: "80%",
    borderRadius: BORDER_RADIUS.lg,
  },
  modalFooter: {
    padding: SPACING.lg,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary.default,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  modalButtonText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  adminBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary.default,
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  kycBannerWrapper: {
    // margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  kycButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 20,
    minWidth: 56,
    minHeight: 44,
    ...SHADOWS.sm,
  },
  kycButtonText: {
    color: COLORS.primary.default,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
