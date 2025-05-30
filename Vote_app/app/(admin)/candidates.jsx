import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../baseUrl";
import { LinearGradient } from "expo-linear-gradient";
import Asterisk from "../../components/asterisk";

export default function RegisterCandidate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [formData, setFormData] = useState({
    candidate_name: "",
    bio: "",
    manifesto: "",
    election_id: "",
  });

  // Fetch upcoming elections for the picker
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoadingElections(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/index2");
          return;
        }

        // Get user's faculty_id from storage or context
        const userDetails = await AsyncStorage.getItem("userDetails");
        const faculty_id = JSON.parse(userDetails)?.faculty_id || "1050"; // Default to 1050 if not found

        const response = await axios.get(
          `${baseUrl}/api/election/upcoming/${faculty_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setElections(response.data);
          if (response.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              election_id: response.data[0].election_id,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to load elections"
        );
      } finally {
        setLoadingElections(false);
      }
    };

    fetchElections();
  }, []);

  const handleSubmit = async () => {
    try {
      if (
        !formData.candidate_name ||
        !formData.bio ||
        !formData.manifesto ||
        !formData.election_id
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/candidate/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Candidate registered successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error registering candidate:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to register candidate"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching elections
  if (loadingElections) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
          </TouchableOpacity>
          <Text style={styles.heading}>Register Candidate</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8612D" />
          <Text style={styles.loadingText}>Loading elections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (elections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
          </TouchableOpacity>
          <Text style={styles.heading}>Register Candidate</Text>
        </View>
        <View style={styles.noElectionsContainer}>
          <Text style={styles.noElectionsText}>
            No upcoming elections available
          </Text>
          <TouchableOpacity
            style={styles.createElectionButton}
            onPress={() => router.push("/(admin)/election")}
          >
            <Text style={styles.createElectionText}>Create an Election</Text>
          </TouchableOpacity>
        </View>
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
      <View style={styles.up}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register Candidate</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Candidate Name</Text>
              <Asterisk />
            </View>
            <TextInput
              style={styles.input}
              value={formData.candidate_name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, candidate_name: text }))
              }
              placeholder="Enter candidate's full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Bio</Text>
              <Asterisk />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, bio: text }))
              }
              placeholder="Enter candidate's biography"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Manifesto</Text>
              <Asterisk />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.manifesto}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, manifesto: text }))
              }
              placeholder="Enter candidate's manifesto"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Election</Text>
              <Asterisk />
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.election_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, election_id: value }))
                }
                style={styles.picker}
              >
                {elections.map((election) => (
                  <Picker.Item
                    key={election.election_id}
                    label={election.title}
                    value={election.election_id}
                    color="#1F2937"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#E8612D", "#FAB09B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Registering..." : "Register Candidate"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  up: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8612D",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 24,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  noElectionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noElectionsText: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
    textAlign: "center",
  },
  createElectionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#E8612D",
  },
  createElectionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
  },
});
