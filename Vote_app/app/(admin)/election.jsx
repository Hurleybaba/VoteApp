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
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../baseUrl";
import { LinearGradient } from "expo-linear-gradient";
import Asterisk from "../../components/asterisk";

export default function Election() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    election_name: "",
    note: "",
    date: "",
    time: "",
    duration: "",
    status: "upcoming",
    faculty_name: "Law",
  });

  const faculties = [
    "Law",
    "Applied Sciences",
    "Pharmacy",
    "Medical Sciences",
    "General",
  ];

  const isValidDate = (dateStr) => {
    // First check the format
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return false;

    const [dayStr, monthStr, yearStr] = dateStr.split("-");
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Basic validation of date components
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < new Date().getFullYear()) return false;

    // Create a date object (note: months are 0-indexed in JavaScript)
    const date = new Date(year, month - 1, day);

    // Validate the date object (handles cases like Feb 30)
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return false;
    }

    // Check if date is in the future (compare at midnight to ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const formatDateInput = (text) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/\D/g, "");

    // Add dashes automatically
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      cleaned = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(
        4,
        8
      )}`;
    }

    return cleaned;
  };

  const isValidTime = (timeStr) => {
    if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;

    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const formatTimeInput = (text) => {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.length > 2) {
      cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }

    return cleaned.slice(0, 5);
  };

  const createDateTime = (dateStr, timeStr) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);

    // Format for MySQL: YYYY-MM-DD HH:MM:SS
    const mysqlFormat = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;

    return mysqlFormat;
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.election_name ||
        !formData.date ||
        !formData.time ||
        !formData.duration ||
        !formData.faculty_name
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      if (!isValidDate(formData.date)) {
        Alert.alert(
          "Invalid Date",
          "Please ensure:\n• Date format is DD-MM-YYYY (e.g., 25-12-2024)\n• Date is in the future\n• Date is valid (not like 31-02-2024)"
        );
        return;
      }

      if (!isValidTime(formData.time)) {
        Alert.alert(
          "Invalid Time",
          "Please use 24-hour format:\n• HH:MM (e.g., 14:30 for 2:30 PM)\n• Hours: 00-23\n• Minutes: 00-59"
        );
        return;
      }

      const durationInt = parseInt(formData.duration, 10);
      if (isNaN(durationInt) || durationInt <= 0) {
        Alert.alert("Error", "Duration must be a positive number");
        return;
      }

      const start_date = createDateTime(formData.date, formData.time);

      console.log("Submitting with data:", {
        ...formData,
        start_date,
        status: "upcoming",
      });

      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/index2");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/election/create`,
        {
          ...formData,
          start_date,
          status: "upcoming",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        // Send notification to backend to notify users
        await axios.post(
          `${baseUrl}/api/notification/send-election-notification`,
          {
            faculty_name: formData.faculty_name,
            election_name: formData.election_name,
            election_id: response.data.election_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        Alert.alert("Success", "Election created successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response data:", error.response?.data);

      let errorMessage = "Failed to create election";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      Alert.alert("Error", errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Text style={styles.heading}>Create Election</Text>
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
              <Text style={styles.label}>Election Name</Text>
              <Asterisk />
            </View>
            <TextInput
              style={styles.input}
              value={formData.election_name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, election_name: text }))
              }
              placeholder="E.g 2025 Elections"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.note}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, note: text }))
              }
              placeholder="Enter additional notes"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Start Date</Text>
              <Asterisk />
            </View>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => {
                const formatted = formatDateInput(text);
                setFormData((prev) => ({ ...prev, date: formatted }));
              }}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#9CA3AF"
              maxLength={10}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Start Time (24 hours format)</Text>
              <Asterisk />
            </View>
            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(text) => {
                const formatted = formatTimeInput(text);
                setFormData((prev) => ({ ...prev, time: formatted }));
              }}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              maxLength={5}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <Asterisk />
            </View>
            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, duration: text }))
              }
              placeholder="Enter duration in minutes"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Upcoming" value="upcoming" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Faculty</Text>
              <Asterisk />
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.faculty_name}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, faculty_name: value }))
                }
                style={styles.picker}
              >
                {faculties.map((faculty) => (
                  <Picker.Item
                    key={faculty}
                    label={faculty}
                    value={faculty}
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
                {isLoading ? "Creating..." : "Create Election"}
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
    height: 100,
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
});
