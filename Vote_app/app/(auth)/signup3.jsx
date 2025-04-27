import {
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
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

export default function signup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFilled, setIsFilled] = useState(false);
  const [error, setError] = useState("");

  const setFormData = useFormStore((state) => state.setFormData);
  const formData = useFormStore((state) => state.formData);

  const handleSubmit = async () => {
    const userDetails = {
      ...formData,
      password,
    };

    try {
      const response = await axios.post(
        "http://192.168.8.100:3000/api/auth/signup",
        userDetails
      );
      if (response.status === 200 || response.status === 201) {
        console.log("Data successfully sent to the server");

        const { token, user } = response.data;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));

        router.push("/(tabs)/home");
      } else {
        console.error("Error sending data to the server");
      }
    } catch (error) {
      setError(error);
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
          <Input
            name="Password"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            keyboardType="default"
          />
          <Input
            name="Confirm Password"
            placeholder="********"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            keyboardType="visible-password"
          />
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
});
