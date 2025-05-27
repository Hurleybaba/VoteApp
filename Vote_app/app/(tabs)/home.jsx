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
} from "react-native";
import image from "@/assets/images/download.jpg";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../baseUrl";
import axios from "axios";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [hasAcademicData, setHasAcademicData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const checkFaceData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/api/face/saa/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Token:", token);

      // Check based on your backend response structure
      if (response.data.success && response.data.userAcademicData) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking academic data:", error);
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
          "Cache-Conrol": "no-cache",
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
          const academicDataExists = await checkFaceData(
            response.data.user.userid
          );

          setHasAcademicData(academicDataExists);
        }
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

  const ElectionCard = ({ title, duration, status, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.electionCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <LinearGradient
            colors={[COLORS.primary.light, COLORS.primary.default]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{status}</Text>
          </LinearGradient>
        </View>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.neutral.gray[600]}
          />
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <Image source={image} style={styles.profileImage} />
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
          <TouchableOpacity onPress={handleKYCRedirect}>
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
                <Ionicons
                  name="arrow-forward-circle"
                  size={32}
                  color={COLORS.neutral.white}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Elections Sections */}
        {kycVerified ? (
          <>
            <SectionHeader
              title="Ongoing Elections"
              onSeeMore={() => router.push("/news")}
            />
            <View style={styles.electionsContainer}>
              <ElectionCard
                title="Student Representative"
                duration="April 8th - 10th"
                status="Active"
                onPress={() => router.push("/(election)/123")}
              />
              <ElectionCard
                title="Department Head"
                duration="April 15th - 17th"
                status="Coming Soon"
                onPress={() => {}}
              />
            </View>

            <SectionHeader
              title="Recent Elections"
              onSeeMore={() => router.push("/news")}
            />
            <View style={styles.electionsContainer}>
              <ElectionCard
                title="Class Representative"
                duration="March 1st - 3rd"
                status="Completed"
                onPress={() => {}}
              />
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
    ...SHADOWS.md,
  },
  kycContent: {
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
