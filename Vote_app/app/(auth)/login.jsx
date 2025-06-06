import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Keyboard } from "react-native";

import voteImg from "../../assets/images/Voting-amico.png";
import Button from "../../components/button";
import Input from "@/components/input";
import { baseUrl } from "../baseUrl";

export default function login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const userDetails = {
      username: username.trim(),
      password: password.trim(),
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        userDetails
      );

      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem("token", token);
        router.push("/(tabs)/home");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || err.response?.status === 401
          ? "Invalid username or password"
          : "Login failed. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkInputFilled = () => {
    if (username.trim() === "" || password.trim() === "") {
      setIsFilled(false);
    } else {
      setIsFilled(true);
    }
  };

  useEffect(() => {
    checkInputFilled();
  }, [username, password]);

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
            <View style={styles.imageContainer}>
              <Image source={voteImg} style={styles.image} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Log in to your account</Text>

              <Input
                name="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                keyboardType="default"
                error={error.username}
                showErrors={showErrors}
              />

              <View style={styles.passwordContainer}>
                <Input
                  name="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  error={error.password}
                  showErrors={showErrors}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?{" "}
                  <Text style={styles.forgotPasswordLink}>Reset it here</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.buttonWrapper}>
          <Button
            text={
              isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                "Log In"
              )
            }
            disabled={!isFilled || isLoading}
            buttonStyle={[
              styles.loginButton,
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
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: 240,
    height: 240,
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
  },
  passwordContainer: {
    position: "relative",
    marginTop: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    zIndex: 1,
  },
  buttonWrapper: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  loginButton: {
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
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#6B7280",
  },
  forgotPasswordLink: {
    color: "#E8612D",
    fontWeight: "600",
  },
});
