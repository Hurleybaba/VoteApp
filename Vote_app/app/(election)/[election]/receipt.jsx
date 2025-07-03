import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import image from "@/assets/images/success.png";
import Button from "@/components/button";
import axios from "axios";
import { baseUrl } from "@/app/baseUrl";
import { COLORS } from "@/constants/theme";

export default function electionId() {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();

  const [voteDetails, setVoteDetails] = useState({});

  const [election, setElection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError] = useState(null);

  const getReceipt = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/votes/get-vote-details/${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );

      if (response.status === 200) {
        setVoteDetails(response.data.voteDetails);
        return true;
      } else {
        throw new Error("Failed to fetch vote details 1");
      }
    } catch (error) {
      console.error("Failed to fetch vote details 2:", error);
      Alert.alert(
        "Error",
        "Failed to fetch vote details. Please try again later."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendReceiptEmail = async () => {
    try {
      setEmailSending(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/api/votes/send-receipt/${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setEmailSent(true);
        setEmailFailed(false);
        Alert.alert(
          "Receipt Sent",
          "A copy of your vote receipt has been sent to your email."
        );
      }
    } catch (error) {
      console.error("Failed to send receipt:", error);
      setEmailFailed(true);
      if (!error.response?.status === 409) {
        Alert.alert("Error", "Failed to send receipt. Please try again later.");
      }
    } finally {
      setEmailSending(false);
    }
  };

  const convertDate = (dateString) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return formatted;
  };

  useEffect(() => {
    const initializeReceipt = async () => {
      const success = await getReceipt();
      if (success && !emailSent) {
        await sendReceiptEmail();
      }
    };

    initializeReceipt();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8612D" />
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
            style={styles.retryButton}
            onPress={getReceipt}
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.receiptCard}>
          <View style={styles.successCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark-sharp" size={48} color="white" />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.electionTitle}>2025 Elections</Text>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>
                  {convertDate(voteDetails.voted_at)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Student</Text>
                <Text
                  style={styles.value}
                >{`${voteDetails.voter_first_name} ${voteDetails.voter_last_name}`}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Voted for</Text>
                <Text
                  style={styles.value}
                >{`${voteDetails.candidate_first_name} ${voteDetails.candidate_last_name}`}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Post</Text>
                <Text style={styles.value}>{voteDetails.election_title}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Ref No</Text>
                <Text style={[styles.value, styles.refNo]}>
                  {voteDetails.ref_no}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.footerText}>Vote recorded securely</Text>
            </View>
          </View>
        </View>

        {emailFailed && !emailSent && !isLoading && (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={sendReceiptEmail}
          >
            <Ionicons name="mail" size={20} color="#E8612D" />
            <Text style={styles.resendText}>Resend Receipt to Email</Text>
          </TouchableOpacity>
        )}

        <Button
          text="RETURN TO HOME"
          buttonStyle={[
            styles.homeButton,
            emailSending && { backgroundColor: "#E8612D80" },
          ]}
          textStyle={styles.buttonText}
          handlePress={() => router.replace("/(tabs)/home")}
          disabled={emailSending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  receiptCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 100,
    alignItems: "center",
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FDD8CD",
    marginTop: -48,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    padding: 24,
    paddingTop: 16,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 16,
  },
  divider: {
    height: 2,
    backgroundColor: "#E8612D",
    opacity: 0.2,
    width: "100%",
    borderRadius: 1,
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  refNo: {
    color: "#E8612D",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
  },
  footerText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  homeButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8612D",
    shadowColor: "#E8612D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendText: {
    color: "#E8612D",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.primary.default,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    minWidth: 300,
    maxWidth: 400,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary.default,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary.default,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: COLORS.primary.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
