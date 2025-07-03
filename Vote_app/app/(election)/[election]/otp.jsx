import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";

const OtpScreen = () => {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [candidateData, setCandidateData] = useState(null);
  const [userData, setUserData] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    getCandidateData();
    sendOTP();
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const getCandidateData = async () => {
    try {
      const data = await AsyncStorage.getItem("candidateData");
      if (data) {
        setCandidateData(JSON.parse(data));
      }
      setUserData(() => AsyncStorage.getItem("userData"));
    } catch (error) {
      console.log("Error getting candidate data:", error);
    }
  };

  const sendOTP = async () => {
    try {
      setResendLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${baseUrl}/api/auth/sendEmail`,
        {
          email: userData?.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        Alert.alert("OTP Sent", "A new code has been sent to your email.");
        setCountdown(60);
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) value = value[value.length - 1]; // Only allow 1 digit
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if there is text
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all inputs are filled
    if (index === inputRefs.current.length - 1 && value) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        verifyOTP(fullOtp);
      }
    }
  };

  // Handle backspace navigation between inputs
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpCode = otp.join("")) => {
    Keyboard.dismiss();
    console.log(otp.join(""));
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${baseUrl}/api/auth/verifyOtp`,
        {
          email: userData?.email,
          otp: otpCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "OTP verified successfully!", [
          {
            text: "Continue",
            onPress: () => {
              router.replace({
                pathname: `/${electionId}/face/`,
                params: {
                  electionId: electionId,
                  candidateId: candidateId,
                },
              });
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Verification failed");
        Alert.alert("Invalid OTP", "The code you entered is incorrect.");
      }
    } catch (error) {
      console.log("OTP verification error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8612D" />
          </TouchableOpacity>

          {/* Process Steps */}
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
              <Text style={styles.processText}>OTP Validation</Text>
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

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={60} color="#E8612D" />
            </View>

            <Text style={styles.heading}>Verify Your Identity</Text>
            <Text style={styles.subheading}>
              {`We've sent a 6-digit verification code to this email address: ${userData?.email}`}
            </Text>

            {candidateData && (
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateLabel}>Voting for:</Text>
                <Text style={styles.candidateName}>
                  {candidateData.first_name} {candidateData.last_name}
                </Text>
              </View>
            )}

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputContainer}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    selectionColor="#E8612D"
                    onFocus={() => {
                      // Dismiss keyboard when tapping outside
                      // Keyboard.dismiss();
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                You can resend in <Text style={styles.timer}>{countdown}</Text>{" "}
                seconds
              </Text>
              <TouchableOpacity
                onPress={sendOTP}
                disabled={countdown > 0 || resendLoading}
                style={styles.resendButton}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#E8612D" />
                ) : (
                  <Text
                    style={[
                      styles.resendButtonText,
                      countdown > 0 && { color: "#ccc" },
                    ]}
                  >
                    Resend Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  candidateInfo: {
    backgroundColor: "#F9FAFB",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
  },
  candidateLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 5,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E8612D",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  otpInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  otpInput: {
    height: 60,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    backgroundColor: "white",
  },
  otpInputFilled: {
    borderColor: "#E8612D",
    backgroundColor: "#FEF2F2",
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
  resendContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  resendText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 10,
  },
  timer: {
    color: "#E8612D",
    fontWeight: "bold",
  },
  resendButton: {
    paddingVertical: 10,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#E8612D",
    fontWeight: "600",
  },
});

export default OtpScreen;
