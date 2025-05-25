import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { baseUrl } from "../baseUrl";

export default function index() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        try {
          // Make a request to check if the token is valid
          const response = await axios.get(`${baseUrl}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            // If the token is valid, navigate to the home screen
            router.push("/(tabs)/home");
          } else {
            router.push("/index2");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // If there was an error (e.g., token expired), navigate to the login page
          if (error.response && error.response.status === 401) {
            router.push("/index2");
            Alert.alert("Session Terminated, please sign in again");
          } else {
            router.push("/index2");
          }
          await AsyncStorage.removeItem("token");
        }
      } else {
        // If no token exists, navigate to the login page
        router.push("/index2");
      }

      setLoading(false); // Done checking login status
    };

    checkLoginStatus();
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E8612D" />
        </View>
      </SafeAreaView>
    );
  }

  return null; // No UI if we're redirecting
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
