import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../../baseUrl";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button";

export default function electionId() {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();

  const [user, setUser] = useState({});
  const [candidate, setCandidate] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCandidate = async () => {
    try {
      setIsLoading(true);
      const candidateData = await AsyncStorage.getItem("candidateData");

      if (!candidateData) {
        Alert.alert("Error", "Candidate data not found");
        setError("Candidate not found");
        return;
      }

      const parsedData = JSON.parse(candidateData);
      if (!parsedData?.first_name) {
        throw new Error("Invalid candidate data format");
      }

      setCandidate(parsedData);
    } catch (error) {
      console.error("Failed to load candidate:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load candidate data");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCandidateData = async () => {
    await AsyncStorage.removeItem("candidateData");
    router.back();
  };

  useEffect(() => {
    getCandidate();
  }, []);

  if (error || !candidate) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "Candidate not available"}
        </Text>
        <TouchableOpacity onPress={getCandidate} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  console.log("CANDIDATE FROM CONFIRM", candidate);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.up}>
          <TouchableOpacity onPress={() => removeCandidateData()}>
            <Ionicons name="chevron-back-outline" size={24} color="#E8612D" />
          </TouchableOpacity>
          <Text style={styles.heading}>Confirm Your Vote</Text>
        </View>

        <View style={styles.processes}>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>1</Text>
            </View>
            <Text style={styles.processText}>Choose Candidate</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>2</Text>
            </View>
            <Text style={styles.processText}>OTP Verification</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>3</Text>
            </View>
            <Text style={styles.processText}>Facial Recognition</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>4</Text>
            </View>
            <Text style={styles.processText}>Confirm Vote</Text>
          </View>
          <View style={styles.brokenLine} />
        </View>

        <Text style={styles.topic}>
          Please confirm your vote for the following candidate
        </Text>

        <View style={styles.candidateCard}>
          <View style={styles.cardBackground} />
          <View style={styles.circle}>
            <Image source={image} style={styles.image} />
          </View>
          <Text style={styles.name}>
            {`${candidate.first_name} ${candidate.last_name}`}
          </Text>
          <Text style={styles.role}>Student Representative Candidate</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="CONFIRM VOTE"
            buttonStyle={styles.confirmButton}
            textStyle={styles.confirmText}
            handlePress={() => {
              router.replace({
                pathname: `/${electionId}/success/`,
                params: {
                  electionId: electionId,
                  candidateId: candidate.candidate_id,
                },
              });
            }}
          />
          <Button
            text="CANCEL"
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelText}
            handlePress={() => removeCandidateData()}
          />
        </View>
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  processText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
  },
  number: {
    fontWeight: "700",
    color: "white",
    fontSize: 16,
  },
  number2: {
    fontWeight: "700",
    color: "#E8612D",
    fontSize: 16,
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
  topic: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  candidateCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#FDD8CD",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    padding: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  confirmButton: {
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
  cancelButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E8612D",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E8612D",
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
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#E8612D",
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
  },
});
