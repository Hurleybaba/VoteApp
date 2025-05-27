import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Button as PaperButton,
  Dialog,
  Portal,
  Text as PaperText,
} from "react-native-paper";

import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../../baseUrl";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button";

export default function profile() {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();

  const [user, setUser] = useState({});
  const [candidate, setCandidate] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getSpecificCandidate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/candidate/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            "X-Election-ID": electionId,
          },
          timeout: 15000,
        }
      );

      if (response.status === 200) {
        setUser(response.data.user);
        setCandidate(response.data.candidate);

        AsyncStorage.setItem(
          "candidateData",
          JSON.stringify(response.data.candidate)
        );
      } else {
        throw new Error("Failed to fetch user/news data");
      }
    } catch (error) {
      console.error("Failed error:", error);
      setError(error.message);

      // Clear invalid token and redirect
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
    getSpecificCandidate();
  };

  const checkFraudVoting = (userid, candidateid) => {
    if (userid === candidateid) {
      showDialog();
    } else {
      router.push({
        pathname: `/${electionId}/confirm/`,
        params: {
          electionId: electionId,
          candidateId: candidate.candidate_id,
        },
      });
    }
  };

  const handleBack = async () => {
    // Clear candidate data before navigating back
    await AsyncStorage.removeItem("candidateData");
    router.back();
  };

  useEffect(() => {
    getSpecificCandidate();
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
          onPress={getSpecificCandidate}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  console.log("elecion id from profile:", electionId);
  console.log("candidate id from profile:", candidateId);
  console.log("user id from profile:", user.userid);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title style={{ fontSize: 16, color: "#1F2937" }}>
            Invalid Vote
          </Dialog.Title>
          <Dialog.Content>
            <PaperText style={{ fontSize: 14, color: "#4B5563" }}>
              You cannot vote for yourself.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={hideDialog} textColor="#E8612D">
              OK
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.up}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back-outline" size={24} color="#E8612D" />
          </TouchableOpacity>
          <Text style={styles.heading}>Candidate Profile</Text>
        </View>

        <View style={styles.parent}>
          <View style={styles.bigCircle} />
          <View style={styles.smallCircle}>
            <Image source={image} style={styles.image} />
          </View>
        </View>

        <Text style={styles.name}>
          {`${candidate.first_name} ${candidate.last_name} ${candidate.middle_name}`}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.sectionContent}>{candidate.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ELECTION MANIFESTO</Text>
          <Text style={styles.sectionContent}>{candidate.manifesto}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <SafeAreaView style={styles.buttonContainer} edges={["bottom"]}>
        <Button
          text="VOTE NOW"
          buttonStyle={styles.voteButton}
          textStyle={styles.voteButtonText}
          handlePress={() =>
            checkFraudVoting(user.userid, candidate.candidate_id)
          }
        />
      </SafeAreaView>
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
    zIndex: 2,
    elevation: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8612D",
  },
  parent: {
    width: "100%",
    height: 300,
    position: "relative",
    marginBottom: 24,
    zIndex: 1,
  },
  bigCircle: {
    width: "200%",
    aspectRatio: 1,
    borderRadius: 999,
    position: "absolute",
    backgroundColor: "#FDD8CD",
    left: "-50%",
    top: -260,
    opacity: 0.7,
    zIndex: 1,
  },
  smallCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "white",
    alignSelf: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    padding: 4,
    zIndex: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 32,
    zIndex: 2,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E8612D",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  voteButton: {
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
  voteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
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
});
