import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BarChart, Grid } from "react-native-svg-charts";
import { Text as SvgText } from "react-native-svg";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/button";

import image from "@/assets/images/download.jpg";

// Constants for chart colors
const CHART_COLORS = [
  "#E8612D",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
];

// Chart label component
const Labels = ({ x, y, bandwidth, data }) => (
  <>
    {data.map((item, index) => (
      <React.Fragment key={index}>
        <SvgText
          x={x(index) + bandwidth / 2}
          y={y(item.value) - 10}
          fontSize={14}
          fontWeight="600"
          fill="#1F2937"
          alignmentBaseline="middle"
          textAnchor="middle"
        >
          {item.value}
        </SvgText>
        <SvgText
          x={x(index) + bandwidth / 2}
          y={290}
          fontSize={14}
          fontWeight="600"
          fill="#4B5563"
          alignmentBaseline="middle"
          textAnchor="middle"
        >
          {item.label}
        </SvgText>
      </React.Fragment>
    ))}
  </>
);

// Helper components
const TimeBox = ({ value, label }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeValue}>{String(value).padStart(2, "0")}</Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

const CandidateCard = ({
  candidate,
  onVote,
  onViewProfile,
  showVoteButton,
  color,
}) => (
  <View style={styles.candidateCard}>
    <View style={styles.candidateContent}>
      <View style={styles.candidateHeader}>
        <View style={styles.candidateInfo}>
          <View
            style={[styles.candidateImg, color && { backgroundColor: color }]}
          >
            <Image style={styles.candidateImage} source={image} />
          </View>
          <View style={styles.candidateDetails}>
            <Text style={styles.candidateName}>
              {`${candidate.first_name} ${candidate.last_name}`}
            </Text>
            {candidate.bio && (
              <Text style={styles.candidateBio} numberOfLines={2}>
                {candidate.bio}
              </Text>
            )}
          </View>
        </View>
        {candidate.votes !== undefined && (
          <View style={styles.voteCount}>
            <Text style={[styles.voteNumber, { color: color }]}>
              {candidate.votes}
            </Text>
            <Text style={styles.voteLabel}>Votes</Text>
          </View>
        )}
      </View>
      <View style={styles.candidateActions}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => onViewProfile(candidate)}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>
        {showVoteButton && (
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => onVote(candidate)}
          >
            <Text style={styles.voteButtonText}>Vote</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

export default function ElectionDetails() {
  const router = useRouter();
  const { electionId } = useLocalSearchParams();

  // State variables
  const [user, setUser] = useState({});
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Check if user has voted in this election
  const checkVoteStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/index2");
        return false;
      }

      const voteStatusResponse = await axios.get(
        `${baseUrl}/api/votes/check-status/${electionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (voteStatusResponse.data.hasVoted) {
        await AsyncStorage.setItem(`voted_${electionId}`, "true");
        Alert.alert(
          "Already Voted",
          "You have already voted in this election.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/news"),
            },
          ]
        );
        return true;
      }

      const localHasVoted = await AsyncStorage.getItem(`voted_${electionId}`);
      if (voteStatusResponse.data.hasVoted === false && localHasVoted) {
        await AsyncStorage.removeItem(`voted_${electionId}`);
      }

      return false;
    } catch (error) {
      console.error("Error checking vote status:", error);
      return false;
    }
  };

  // Fetch election details
  const getElectionDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/index2");
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

      if (response.status === 200) {
        setElection(response.data.election);
      }
    } catch (error) {
      console.error("Error fetching election details:", error);
      setError("Failed to fetch election details");
    }
  };

  // Fetch candidates
  const getCandidates = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.get(`${baseUrl}/api/candidate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          "x-election-id": electionId,
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setCandidates(response.data.candidates);
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      setError("Failed to fetch candidates");
    }
  };

  // Fetch results for ended elections
  const getCandidatesAndVotes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.get(`${baseUrl}/api/votes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          "X-Election-ID": electionId,
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        const candidatesWithVotes = response.data.candidates.map(
          (candidate) => {
            const voteInfo = response.data.votes.find(
              (v) => v.candidate_id === candidate.candidate_id
            );
            return {
              ...candidate,
              votes: voteInfo ? voteInfo.vote_count : 0,
            };
          }
        );
        setCandidates(candidatesWithVotes);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setError("Failed to fetch election results");
    }
  };

  // Change election status
  const changeElectionStatus = async (status) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.put(
        `${baseUrl}/api/election/${electionId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.status === 200) {
        await axios.post(
          `${baseUrl}/api/notification/send-status-notification`,
          {
            faculty_name: election.faculty_name,
            election_name: election.election_name,
            election_id: electionId,
            new_status: status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        await getElectionDetails();
      }
    } catch (error) {
      console.error("Error changing election status:", error);
      Alert.alert("Error", "Failed to update election status");
    }
  };

  // Initialize data
  const initializeData = async () => {
    setIsLoading(true);
    try {
      await getElectionDetails();
      const voted = await checkVoteStatus();
      setHasVoted(voted);

      if (!voted) {
        if (election?.status === "ended") {
          await getCandidatesAndVotes();
        } else {
          await getCandidates();
        }
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      setError("Failed to load election data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
  };

  // Set up timer for upcoming/ongoing elections
  useEffect(() => {
    if (!election?.start_date) return;

    const timer = setInterval(() => {
      const now = new Date();
      const startDate = new Date(election.start_date);
      const durationMs = election.duration * 60 * 1000;
      const endDate = new Date(startDate.getTime() + durationMs);

      if (election.status === "upcoming") {
        const timeUntilStart = startDate.getTime() - now.getTime();

        if (timeUntilStart <= 0) {
          clearInterval(timer);
          changeElectionStatus("ongoing");
          return;
        }

        const totalSeconds = Math.floor(timeUntilStart / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);

        setTimeLeft({
          days: Math.floor(totalHours / 24),
          hours: totalHours % 24,
          minutes: totalMinutes % 60,
          seconds: totalSeconds % 60,
        });
      } else if (election.status === "ongoing") {
        const timeUntilEnd = endDate.getTime() - now.getTime();

        if (timeUntilEnd <= 0) {
          clearInterval(timer);
          changeElectionStatus("ended");
          return;
        }

        const totalSeconds = Math.floor(timeUntilEnd / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);

        setTimeLeft({
          days: 0,
          hours,
          minutes: totalMinutes % 60,
          seconds: totalSeconds % 60,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  useEffect(() => {
    initializeData();
  }, []);

  const renderUpcomingElection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Election</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.electionHeader}>
          <Text style={styles.electionTitle}>{election?.election_name}</Text>
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
            <Text style={styles.infoValue}>{election?.duration} minutes</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Faculty:</Text>
            <Text style={styles.infoValue}>{election?.faculty_name}</Text>
          </View>
        </View>

        {candidates.length > 0 && (
          <View style={styles.candidatesSection}>
            <Text style={styles.sectionTitle}>Registered Candidates</Text>
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.candidate_id}
                candidate={candidate}
                onViewProfile={(candidate) =>
                  router.push({
                    pathname: `/${electionId}/profile/`,
                    params: { candidateId: candidate.candidate_id },
                  })
                }
                showVoteButton={false}
              />
            ))}
          </View>
        )}
      </View>
    </>
  );

  const renderOngoingElection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
        </TouchableOpacity>
        <Text style={styles.heading}>Vote for Student Representative</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>Time Remaining:</Text>
        <Text style={styles.timerText}>
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.processes}>
        <View style={styles.process}>
          <View style={styles.processImg}>
            <Text style={styles.number}>1</Text>
          </View>
          <Text style={styles.processText}>ID Validation</Text>
        </View>
        <View style={styles.process}>
          <View style={styles.processImg}>
            <Text style={styles.number}>2</Text>
          </View>
          <Text style={styles.processText}>Choose Candidate</Text>
        </View>
        <View style={styles.process}>
          <View style={styles.processImg2}>
            <Text style={styles.number2}>3</Text>
          </View>
          <Text style={styles.processText}>Facial Recognition</Text>
        </View>
        <View style={styles.process}>
          <View style={styles.processImg2}>
            <Text style={styles.number2}>4</Text>
          </View>
          <Text style={styles.processText}>Confirm Vote</Text>
        </View>
        <View style={styles.brokenLine}></View>
      </View>

      <Text style={styles.choose}>Choose your preferred candidate</Text>

      <View style={styles.collection}>
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.candidate_id}
            candidate={candidate}
            onViewProfile={(candidate) =>
              router.push({
                pathname: `/${electionId}/profile/`,
                params: { candidateId: candidate.candidate_id },
              })
            }
            onVote={(candidate) => {
              if (user.userid === candidate.candidate_id) {
                Alert.alert("Invalid Vote", "You cannot vote for yourself.", [
                  { text: "OK" },
                ]);
              } else {
                router.push({
                  pathname: `/${electionId}/confirm/`,
                  params: {
                    electionId: electionId,
                    candidateId: candidate.candidate_id,
                  },
                });
              }
            }}
            showVoteButton={true}
          />
        ))}
      </View>
    </>
  );

  const renderEndedElection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="#E8612D" />
        </TouchableOpacity>
        <Text style={styles.heading}>Election Results</Text>
      </View>

      <Text style={styles.choose}>Final Vote Count</Text>

      <View style={styles.collection}>
        {candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.candidate_id}
            candidate={candidate}
            color={CHART_COLORS[index % CHART_COLORS.length]}
            onViewProfile={(candidate) =>
              router.push({
                pathname: `/${electionId}/profile/`,
                params: { candidateId: candidate.candidate_id },
              })
            }
            showVoteButton={false}
          />
        ))}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Vote Distribution</Text>
        <View style={{ height: 300 }}>
          <BarChart
            style={{ flex: 1 }}
            data={candidates.map((candidate, index) => ({
              value: candidate.votes || 0,
              svg: { fill: CHART_COLORS[index % CHART_COLORS.length] },
              label: `${candidate.first_name.charAt(
                0
              )}${candidate.last_name.charAt(0)}`,
            }))}
            yAccessor={({ item }) => item.value}
            contentInset={{ top: 30, bottom: 30 }}
            spacingInner={0.4}
            gridMin={0}
          >
            <Grid direction={Grid.Direction.HORIZONTAL} />
            <Labels />
          </BarChart>
        </View>
      </View>

      <View style={styles.legendContainer}>
        {candidates.map((candidate, index) => (
          <View key={candidate.candidate_id} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
              ]}
            />
            <Text style={styles.legendText}>
              {`${candidate.first_name} ${candidate.last_name}`}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={initializeData} style={styles.retryButton}>
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
            colors={["#E8612D"]}
            tintColor="#E8612D"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {election?.status === "upcoming" && renderUpcomingElection()}
        {election?.status === "ongoing" && renderOngoingElection()}
        {election?.status === "ended" && renderEndedElection()}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.buttonWrapper}>
        <Button
          text="Back to News"
          buttonStyle={styles.backToNewsButton}
          textStyle={styles.backToNewsButtonText}
          handlePress={() => router.replace("/(tabs)/news")}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#E8612D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8612D",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  backButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  candidatesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  candidateCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  candidateContent: {
    padding: 16,
  },
  candidateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  candidateInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  candidateImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8612D",
    padding: 2,
    marginRight: 12,
  },
  candidateImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  candidateBio: {
    fontSize: 14,
    color: "#6B7280",
  },
  candidateActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  profileButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButtonText: {
    color: "#E8612D",
    fontSize: 14,
    fontWeight: "600",
  },
  voteButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E8612D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  voteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  voteCount: {
    alignItems: "center",
  },
  voteNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  voteLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  legendContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#4B5563",
  },
  processes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    position: "relative",
    paddingHorizontal: 10,
  },
  process: {
    width: 70,
    alignItems: "center",
    gap: 8,
  },
  processImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E8612D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  processImg2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAB09B",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  number2: {
    fontWeight: "bold",
    color: "#E8612D",
    fontSize: 16,
  },
  processText: {
    fontSize: 12,
    textAlign: "center",
    color: "#4B5563",
    fontWeight: "500",
  },
  brokenLine: {
    borderBottomWidth: 2,
    position: "absolute",
    borderStyle: "dashed",
    borderColor: "#FAB09B",
    top: 18,
    left: 45,
    right: 45,
    zIndex: -1,
  },
  timerContainer: {
    backgroundColor: "#FEE4E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E8612D",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E8612D",
  },
  buttonWrapper: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  backToNewsButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8612D",
    shadowColor: "#E8612D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  backToNewsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
