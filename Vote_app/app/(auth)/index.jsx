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
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          try {
            const response = await axios.get(`${baseUrl}/api/auth/user`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
              router.push("/(tabs)/home");
            } else {
              router.push("/index2");
            }
          } catch (error) {
            await AsyncStorage.removeItem("token");
            if (error.response && error.response.status === 401) {
              Alert.alert(
                "Session Expired",
                "Your session has expired. Please sign in again.",
                [{ text: "OK" }]
              );
            } else {
              Alert.alert(
                "Error",
                "Something went wrong. Please try again later.",
                [{ text: "OK" }]
              );
            }
            router.push("/index2");
          }
        } else {
          router.push("/index2");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to check login status. Please try again.",
          [{ text: "OK" }]
        );
        router.push("/index2");
      } finally {
        setLoading(false);
      }
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

  return null;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
