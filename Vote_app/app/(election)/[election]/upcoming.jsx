import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { baseUrl } from "@/app/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function UpcomingElection() {
  const router = useRouter();
  const { electionId } = useLocalSearchParams();
  const [election, setElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const fetchElectionDetails = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.error("Token not found");
        router.replace("/index2");
        return;
      }

      console.log("Using token:", token);
      console.log("Fetching election ID:", electionId);

      if (!electionId) {
        console.error("Election ID is not provided");
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/election/${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );
      console.log("Response data:", response.data);
      setElection(response.data.election);
    } catch (error) {
      console.error("Error fetching election details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeElectionStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.error("Token not found");
        router.replace("/index2");
        return;
      }

      const response = await axios.put(
        `${baseUrl}/api/election/${electionId}/status`,
        {
          status: "ongoing",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );

      if (response.status === 200) {
        console.log("Election status changed successfully");

        router.replace({
          pathname: `/(election)/${electionId}/indexx`,
          params: {
            electionId: electionId,
          },
        });
      } else {
        console.error("Failed to change election status");
      }
    } catch (error) {
      console.error("Error changing election status:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${baseUrl}/api/candidate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Election-ID": electionId,
        },
      });

      // Ensure we're setting an array, even if empty
      setCandidates(
        Array.isArray(response.data?.candidates) ? response.data.candidates : []
      );
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]); // Set empty array on error
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchElectionDetails();
  }, [electionId]);

  useEffect(() => {
    if (!election?.start_date) {
      console.log("No start date available");
      return;
    }

    const timer = setInterval(async () => {
      try {
        const now = new Date();
        const startDate = new Date(election.start_date);

        // console.log("Current time:", now.toLocaleString());
        // console.log("Start date:", startDate.toLocaleString());

        // Validate start date
        if (isNaN(startDate.getTime())) {
          console.error("Invalid start date format:", election.start_date);
          clearInterval(timer);
          return;
        }

        const timeUntilStart = startDate.getTime() - now.getTime();
        // console.log("Time until election starts (ms):", timeUntilStart);

        // If election has started
        if (timeUntilStart <= 0) {
          console.log("Election has started - redirecting to voting page");
          clearInterval(timer);
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });

          await changeElectionStatus();

          return;
        }

        // Calculate remaining time until start
        const totalSeconds = Math.floor(timeUntilStart / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);

        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
        });
      } catch (error) {
        console.error("Error updating countdown:", error);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [election, electionId, router]);

  useEffect(() => {
    if (electionId) {
      fetchCandidates();
    }
  }, [electionId]);

  // Add a debug effect to monitor timeLeft changes
  useEffect(() => {
    console.log("TimeLeft state updated:", timeLeft);
  }, [timeLeft]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8612D" />
      </SafeAreaView>
    );
  }

  const TimeBox = ({ value, label }) => (
    <View style={styles.timeBox}>
      <Text style={styles.timeValue}>{String(value).padStart(2, "0")}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  const CandidateCard = ({ candidate }) => (
    <View style={styles.candidateCard}>
      <View style={styles.candidateContent}>
        <View style={styles.candidateHeader}>
          <Text
            style={styles.candidateName}
          >{`${candidate.first_name} ${candidate.last_name}`}</Text>
          <TouchableOpacity
            style={styles.manifestoButton}
            onPress={() => Alert.alert("Manifesto", candidate.manifesto)}
          >
            <Text style={styles.manifestoButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Election</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.card}>
          <View style={styles.electionHeader}>
            <Text style={styles.electionTitle}>{election?.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Upcoming</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.countdownTitle}>Election Starts In</Text>
          <View style={styles.countdownContainer}>
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hours" />
            <TimeBox value={timeLeft.minutes} label="Minutes" />
            <TimeBox value={timeLeft.seconds} label="Seconds" />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Start Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(election?.start_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>{election?.duration} hours</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Faculty:</Text>
              <Text style={styles.infoValue}>{election?.faculty_id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="create-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>
                {new Date(election?.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.infoLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      election?.status === "upcoming" ? "#FEE4E2" : "#E5E7EB",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        election?.status === "upcoming" ? "#E8612D" : "#6B7280",
                    },
                  ]}
                >
                  {election?.status?.charAt(0).toUpperCase() +
                    election?.status?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {election?.note && (
            <View style={styles.noteContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#6B7280"
              />
              <View style={styles.noteContent}>
                <Text style={styles.noteLabel}>Election Note:</Text>
                <Text style={styles.noteText}>{election.note}</Text>
              </View>
            </View>
          )}

          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle" size={24} color="#E8612D" />
            <Text style={styles.noticeText}>
              You will be notified when the election starts. Make sure to have
              your student ID ready for voting.
            </Text>
          </View>

          <View style={styles.candidatesSection}>
            <View style={styles.candidatesHeader}>
              <Text style={styles.candidatesTitle}>Approved Candidates</Text>
              <Text style={styles.candidatesCount}>
                {candidates?.length || 0}{" "}
                {(candidates?.length || 0) === 1 ? "Candidate" : "Candidates"}
              </Text>
            </View>

            {loadingCandidates ? (
              <ActivityIndicator
                size="small"
                color="#E8612D"
                style={styles.candidatesLoader}
              />
            ) : !candidates || candidates.length === 0 ? (
              <View style={styles.noCandidates}>
                <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                <Text style={styles.noCandidatesText}>
                  No candidates registered yet
                </Text>
              </View>
            ) : (
              <View style={styles.candidatesList}>
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.candidate_id || Math.random().toString()}
                    candidate={candidate}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  electionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  electionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  badge: {
    backgroundColor: "#FEE4E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#E8612D",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timeBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 72,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8612D",
  },
  timeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  noticeContainer: {
    backgroundColor: "#FFF5F1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  noticeText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  noteContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  noteContent: {
    flex: 1,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  candidatesSection: {
    marginTop: 24,
  },
  candidatesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  candidatesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  candidatesCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  candidatesLoader: {
    marginVertical: 20,
  },
  noCandidates: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  noCandidatesText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  candidatesList: {
    gap: 16,
  },
  candidateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  candidateContent: {
    padding: 12,
  },
  candidateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  manifestoButton: {
    alignSelf: "center",
  },
  manifestoButtonText: {
    color: "#E8612D",
    fontSize: 14,
    fontWeight: "500",
  },
});
