import {
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Input from "../../components/input";
import Button from "../../components/button";
import { useFormStore } from "../../components/store";
import { baseUrl } from "../baseUrl";

export default function signup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFilled, setIsFilled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setFormData = useFormStore((state) => state.setFormData);
  const formData = useFormStore((state) => state.formData);

  const handleSubmit = async () => {
    const userDetails = {
      ...formData,
      password,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/signup`,
        userDetails
      );
      console.log("Response:", response);
      if (response.status === 200 || response.status === 201) {
        console.log("Data successfully sent to the server");

        const { token } = response.data;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem("token", token);

        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          router.replace("/login");
        }, 3000);
      } else {
        console.error("Error sending data to the server");
      }
    } catch (error) {
      // setError(error);
      console.error("Error sending data:", error);
    }
  };

  const checkInputFilled = () => {
    if (
      password.trim() === "" ||
      confirmPassword.trim() === "" ||
      password !== confirmPassword
    ) {
      setIsFilled(false);
    } else {
      setIsFilled(true);
    }
  };

  useEffect(() => {
    checkInputFilled();
  }, [password, confirmPassword]);

  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <Text style={styles.heading}>Set up a password</Text>

          <View style={styles.passwordContainer}>
            <Input
              name="Password"
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              keyboardType="default"
              secureTextEntry={!showPassword}
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

          <View style={styles.passwordContainer}>
            <Input
              name="Confirm Password"
              placeholder="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              keyboardType="default"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Button
          text="Continue"
          disabled={!isFilled}
          buttonStyle={
            isFilled
              ? {
                  position: "absolute",
                  bottom: 20,
                  marginLeft: 20,
                }
              : {
                  backgroundColor: "#DADADA",
                  position: "absolute",
                  bottom: 20,
                  marginLeft: 20,
                  width: "105%",
                  left: "-2.5%",
                }
          }
          handlePress={handleSubmit}
        />
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <Text style={styles.popupText}>
                Registration Success! Please wait while we redirect you to the
                login page.{" "}
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="green"
                  style={styles.backIcon}
                />
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#E8612D",
  },
  subheading: {
    fontSize: 14,
    fontWeight: "light",
    marginBottom: 10,
    color: "gray",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    zIndex: 1,
  },
  popupContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    elevation: 10,
  },
  popupText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});
