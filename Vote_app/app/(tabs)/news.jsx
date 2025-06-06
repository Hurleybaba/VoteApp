import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../baseUrl";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";

const NewsCard = ({ icon, title, details }) => (
  <TouchableOpacity style={styles.newsCard}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={COLORS.primary.default} />
    </View>
    <View style={styles.newsContent}>
      <Text style={styles.newsTitle}>{title}</Text>
      <Text style={styles.newsDetails} numberOfLines={2}>
        {details}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function News() {
  const router = useRouter();

  const [user, setUser] = useState({});
  const [generalElections, setGeneralElections] = useState([]);
  const [facultyElections, setFacultyElections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const checkLoginStatusAndFetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/index2");
        return;
      }

      const isUserVerified = await AsyncStorage.getItem("isUserVerified");
      setKycVerified(isUserVerified === "true");

      const response = await axios.get(`${baseUrl}/api/election`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        setUser(response.data.user);
        // Split elections into general and faculty

        setGeneralElections(response.data.posts);
        setFacultyElections(response.data.facultyPosts);
      } else {
        throw new Error("Failed to fetch user/news data");
      }
    } catch (error) {
      console.error("Failed error:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.removeItem("token");
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

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

  const handleElectionPress = (status, id) => {
    if (status === "ongoing") {
      router.push({
        pathname: `/(election)/${id}/indexx`,
        params: { electionId: id },
      });
    } else if (status === "ended") {
      router.push({
        pathname: `/(election)/${id}/ended`,
        params: { electionId: id },
      });
    } else {
      router.push({
        pathname: `/(election)/${id}/upcoming`,
        params: { electionId: id },
      });
    }
  };

  const renderElectionItem = ({ item }) => {
    const statusColors = {
      ended: COLORS.feedback.error,
      ongoing: COLORS.feedback.success,
      upcoming: COLORS.feedback.info,
    };

    const color = statusColors[item.status] || COLORS.primary.default;

    return (
      <TouchableOpacity
        onPress={() => handleElectionPress(item.status, item.election_id)}
        style={styles.electionCard}
      >
        <View style={[styles.statusBar, { backgroundColor: color }]} />
        <View style={styles.electionContent}>
          <View style={styles.electionInfo}>
            <Text style={styles.electionTitle}>{item.election_name}</Text>
            <Text style={styles.electionDate}>
              {item.created_at
                ? new Date(
                    item.created_at.replace(" ", "T")
                  ).toLocaleDateString()
                : ""}
            </Text>
          </View>
          <View style={styles.statusSection}>
            <View
              style={[styles.statusBadge, { backgroundColor: `${color}15` }]}
            >
              <Text style={[styles.statusText, { color }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.neutral.gray[400]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderElectionSection = (title, elections) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {elections.length > 0 ? (
        <FlatList
          data={elections}
          renderItem={renderElectionItem}
          keyExtractor={(item) => item.election_id?.toString()}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={COLORS.neutral.gray[300]}
          />
          <Text style={styles.emptyStateText}>No elections found</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
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
        <LinearGradient
          colors={[COLORS.primary.default, COLORS.primary.light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.heading}>Latest Updates & News</Text>
          <Text style={styles.subheading}>
            Stay informed with real-time updates and announcements regarding the
            app, and ongoing and upcoming Elections
          </Text>
        </LinearGradient>

        {!kycVerified ? (
          <View style={styles.kycPrompt}>
            <Ionicons
              name="shield-outline"
              size={40}
              color={COLORS.primary.default}
            />
            <Text style={styles.kycTitle}>Verification Required</Text>
            <Text style={styles.kycText}>
              Complete your KYC verification to access election news and updates
            </Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => router.push("/kyc-verification")}
            >
              <Text style={styles.verifyButtonText}>Verify Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Updates</Text>
              <NewsCard
                icon="newspaper-outline"
                title="New Features Available"
                details="App v1.0001 released - Now includes Face ID login and improved security measures"
              />
              <NewsCard
                icon="book-outline"
                title="Voter Education"
                details="Learn about the voting process and how to verify your eligibility"
              />
            </View>

            {renderElectionSection("General Elections", generalElections)}
            {renderElectionSection("Faculty Elections", facultyElections)}
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
    padding: SPACING.xl,
    paddingTop: SPACING["3xl"],
    paddingBottom: SPACING["2xl"],
  },
  heading: {
    fontSize: TYPOGRAPHY.sizes["2xl"],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.neutral.white,
    opacity: 0.9,
    lineHeight: TYPOGRAPHY.sizes.md * 1.4,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary.default,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  newsCard: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.neutral.gray[100],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary.default}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary.default,
    marginBottom: SPACING.xs,
  },
  newsDetails: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.gray[600],
    lineHeight: TYPOGRAPHY.sizes.sm * 1.4,
  },
  electionCard: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  statusBar: {
    width: 4,
  },
  electionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
  },
  electionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  electionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary.default,
    marginBottom: SPACING.xs,
  },
  electionDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.neutral.gray[500],
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  kycPrompt: {
    margin: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.neutral.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  kycTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary.default,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  kycText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.neutral.gray[600],
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.sizes.md * 1.4,
  },
  verifyButton: {
    backgroundColor: COLORS.primary.default,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  verifyButtonText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: "center",
    backgroundColor: COLORS.neutral.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.neutral.gray[500],
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
});
