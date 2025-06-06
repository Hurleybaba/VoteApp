import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Keyboard } from "react-native";

import Button from "../../components/button";
import Input from "@/components/input";
import { baseUrl } from "../baseUrl";

export default function VerifyOTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!otp.trim()) {
      newErrors.otp = "Verification code is required";
      isValid = false;
    } else if (otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit code";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/sendEmail`, { email });
      setCanResend(false);
      setTimer(60);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Failed to resend verification code. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/auth/verifyOtp`, {
        email,
        otp: otp.trim(),
      });

      if (response.status === 200) {
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email, token: response.data.token },
        });
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Invalid verification code. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsFilled(otp.trim() !== "" && otp.length === 6);
  }, [otp]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#E8612D" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to {email}
              </Text>

              <Input
                name="Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={(text) =>
                  setOtp(text.replace(/[^0-9]/g, "").slice(0, 6))
                }
                keyboardType="number-pad"
                maxLength={6}
                error={error.otp}
                showErrors={showErrors}
              />

              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendText}>Resend Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>Resend code in {timer}s</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.buttonWrapper}>
          <Button
            text={
              isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                "Verify Code"
              )
            }
            disabled={!isFilled || isLoading}
            buttonStyle={[
              styles.submitButton,
              (!isFilled || isLoading) && styles.disabledButton,
            ]}
            handlePress={handleSubmit}
          />
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDD8CD",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    color: "#E8612D",
    fontSize: 16,
    fontWeight: "600",
  },
  timerText: {
    color: "#6B7280",
    fontSize: 16,
  },
  buttonWrapper: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  submitButton: {
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
  disabledButton: {
    backgroundColor: "#FDA4A4",
    shadowOpacity: 0,
    elevation: 0,
  },
});
