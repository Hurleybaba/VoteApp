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
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/button";

import image from "@/assets/images/download.jpg";

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

const colorss = [
  "#E8612D",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
];

const ResultCard = ({ candidate, color }) => (
  <View style={styles.resultCard}>
    <View style={styles.candidateInfo}>
      <View style={[styles.candidateImg, { backgroundColor: color }]}>
        <Image style={styles.image} source={image} />
      </View>
      <Text
        style={styles.candidateName}
      >{`${candidate.first_name} ${candidate.last_name}`}</Text>
    </View>
    <View style={styles.voteCount}>
      <Text style={[styles.voteText, { color }]}>{candidate.votes}</Text>
      <Text style={styles.voteLabel}>Votes</Text>
    </View>
  </View>
);

const LegendItem = ({ color, name }) => (
  <View style={styles.legendItem}>
    <View style={[styles.colorDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{name}</Text>
  </View>
);

export default function electionId() {
  const router = useRouter();
  const { electionId } = useLocalSearchParams();

  console.log("elecion id:", electionId);

  const [user, setUser] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [voteData, setVoteData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const chartData = candidates.map((candidate, index) => ({
    value: candidate.votes || 0, // Now using the votes property we added
    svg: { fill: colorss[index % colorss.length] },
    label: `${candidate.first_name.charAt(0)}${candidate.last_name.charAt(0)}`,
    fullName: `${candidate.first_name} ${candidate.last_name}`,
  }));

  const getCandidatesAndVotes = async () => {
    setIsLoading(true);
    setError(null);

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
        setUser(response.data.user);

        // Verify data structure
        if (!response.data.candidates || !response.data.votes) {
          throw new Error("Invalid data structure from API");
        }

        // Combine candidates with their vote counts
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

        // Debug: Log the processed data
        console.log("Processed Candidates:", candidatesWithVotes);
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }

      // ... rest of your error handling
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    getCandidatesAndVotes();
  };

  useEffect(() => {
    getCandidatesAndVotes();
  }, []);

  if (isLoading || !user) {
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
          onPress={getCandidatesAndVotes}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
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
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#E8612D" />
          </TouchableOpacity>
          <Text style={styles.heading}>Election Results</Text>
        </View>

        <Text style={styles.choose}>Current Vote Count</Text>

        <View style={styles.collection}>
          {candidates.map((candidate, index) => (
            <ResultCard
              key={candidate.candidate_id}
              candidate={candidate}
              color={colorss[index % colorss.length]}
            />
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Vote Distribution</Text>
          <View style={{ height: 300 }}>
            <BarChart
              style={{ flex: 1 }}
              data={chartData}
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
            <LegendItem
              key={candidate.candidate_id}
              color={colorss[index % colorss.length]}
              name={`${candidate.first_name} ${candidate.last_name}`}
            />
          ))}
        </View>

        <Button
          text="Back to News"
          buttonStyle={{
            backgroundColor: "#E8612D",
            borderRadius: 24,
            height: 48,
            marginBottom: 24,
            shadowColor: "#E8612D",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          textStyle={{
            fontSize: 16,
            fontWeight: "600",
            color: "white",
          }}
          handlePress={() => {
            router.replace("/(tabs)/news");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  up: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8612D",
  },
  choose: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    color: "#1F2937",
  },
  resultCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  candidateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  candidateImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  voteCount: {
    alignItems: "center",
  },
  voteText: {
    fontSize: 20,
    fontWeight: "700",
  },
  voteLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#E8612D",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#E8612D",
    padding: 16,
    borderRadius: 20,
  },
  retryText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
