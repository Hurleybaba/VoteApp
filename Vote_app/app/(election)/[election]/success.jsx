import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import image from "@/assets/images/success.png";
import axios from "axios";
import { baseUrl } from "@/app/baseUrl";

export default function VoteConfirmation() {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteRecorded, setVoteRecorded] = useState(false);

  const [user, setUser] = useState({});
  const [candidate, setCandidate] = useState({});

  const fetchCandidateDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${baseUrl}/api/candidate/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );
      console.log("response", response.data);
      if (response.status === 200) {
        setCandidate(response.data.candidate);
        setUser(response.data.user);
      } else {
        throw new Error("Failed to fetch candidate details");
      }
    } catch (error) {
      console.error("Failed to fetch candidate:", error);
      throw error;
    }
  };

  const recordVote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("You are not logged in");
      }
      console.log("candidate id here", candidateId);
      console.log("Election id here", electionId);
      if (!electionId || !candidateId) {
        throw new Error("Invalid election or candidate selected");
      }

      // First verify the candidate exists
      const candidateResponse = await axios.get(
        `${baseUrl}/api/candidate/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!candidateResponse.data.candidate) {
        throw new Error("Failed to fetch candidate details");
      }

      const candidateData = candidateResponse.data.candidate;
      console.log("Candidate data:", candidateData);
      console.log("CandidateId from params:", candidateId);
      console.log("ElectionId from params:", electionId);

      // Verify the candidate belongs to the correct election
      if (candidateData.election_id !== electionId) {
        throw new Error("Candidate does not belong to this election");
      }

      const response = await axios.post(
        `${baseUrl}/api/votes/record-vote/${electionId}/${candidateId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Vote recorded successfully:", response.data);
        await AsyncStorage.setItem(`voted_${electionId}`, "true");
        setVoteRecorded(true);
        setCandidate(candidateData);
        setUser(candidateResponse.data.user);

        // Navigate after 2 seconds (more user-friendly)
        setTimeout(() => {
          router.replace({
            pathname: `/(election)/${electionId}/receipt`,
            params: { electionId, candidateId },
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to record vote");
      }
    } catch (error) {
      console.error("Voting error:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.removeItem("token");
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("/index2") },
        ]);
      } else if (error.response?.status === 400) {
        Alert.alert("Already Voted", "You have already voted in this election");
      } else {
        Alert.alert("Error", error.message || "Failed to submit vote");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    recordVote();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.default} />
        <Text style={styles.loadingText}>Processing your vote...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" translucent />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.header}>Thank You!</Text>
          <Text style={styles.subHeader}>
            Your vote was submitted successfully.
          </Text>

          <Image source={image} style={styles.image} resizeMode="contain" />

          <Text style={styles.footerText}>
            The receipt is being sent to your email address
          </Text>

          {voteRecorded && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary.default}
              style={styles.loader}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.primary.default,
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    textAlign: "center",
    color: COLORS.text,
    marginBottom: 30,
  },
  image: {
    width: 240,
    height: 240,
    marginVertical: 30,
  },
  footerText: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary.default,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});
