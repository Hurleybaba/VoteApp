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
import {
  Button as PaperButton,
  Dialog,
  Portal,
  Text as PaperText,
} from "react-native-paper";
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

export default function electionId() {
  const router = useRouter();
  const { electionId } = useLocalSearchParams();

  console.log("elecion id:", electionId);

  const [user, setUser] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getCandidates = async () => {
    setIsLoading(true);
    setError(null);

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
          "X-Election-ID": electionId,
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setCandidates(response.data.candidates);
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
    getCandidates();
  };

  useEffect(() => {
    getCandidates();
  }, []);

  const checkFraudVoting = (userid, candidate) => {
    if (userid === candidate.candidate_id) {
      showDialog();
    } else {
      AsyncStorage.setItem("candidateData", JSON.stringify(candidate));
      router.push({
        pathname: `/${electionId}/confirm/`,
        params: {
          electionId: electionId,
          candidateId: candidate.candidate_id,
        },
      });
    }
  };

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
        <TouchableOpacity onPress={getCandidates} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderCandidates = ({ item }) => {
    return (
      <View style={styles.candidate}>
        <View style={styles.top}>
          <View style={styles.candidateImg}>
            <Image style={styles.image} source={image} />
          </View>
          <View style={styles.right}>
            <Text
              style={styles.candidateName}
            >{`${item.first_name} ${item.last_name}`}</Text>
            <Text style={styles.candidateDetails} numberOfLines={2}>
              {item.bio}
            </Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: `/${electionId}/profile/`,
                params: {
                  electionId: electionId,
                  candidateId: item.candidate_id,
                },
              });
            }}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button2}
            onPress={() => checkFraudVoting(user.userid, item)}
          >
            <Text style={styles.buttonText2}>Vote</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title style={{ fontSize: 16 }}>Invalid Vote</Dialog.Title>
          <Dialog.Content>
            <PaperText style={{ fontSize: 14 }}>
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
      >
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
          </TouchableOpacity>
          <Text style={styles.heading}>Vote for Student Representative</Text>
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
          <FlatList
            data={candidates}
            renderItem={renderCandidates}
            keyExtractor={(item) => item.candidate_id?.toString()}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", padding: 20 }}>
                No elections found
              </Text>
            }
            scrollEnabled={false}
          />
        </View>

        <Button
          text="Back to News Page"
          buttonStyle={{
            elevation: 5,
            backgroundColor: "#E8612D",
          }}
          textStyle={{
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
          }}
          handlePress={() => {
            router.replace("/(tabs)/home");
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
    textAlign: "center",
    color: "#4B5563",
    fontWeight: "500",
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
  choose: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    color: "#1F2937",
  },
  collection: {
    gap: 16,
    marginBottom: 32,
  },
  candidate: {
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  top: {
    width: "100%",
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  candidateImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8612D",
    padding: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  right: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  candidateDetails: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E8612D",
  },
  button2: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
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
    color: "#E8612D",
  },
  buttonText2: {
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
