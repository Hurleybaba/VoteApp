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
import Asterisk from "@/components/asterisk";
import { baseUrl } from "../baseUrl";
import Privacy from "../../components/privacy";

export default function login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    const userDetails = {
      username,
      password,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        userDetails
      );
      console.log("Response:", response);
      if (response.status === 200) {
        console.log("User successfully logged in");

        const { token } = response.data;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem("token", token);

        router.push("/(tabs)/home");
      } else {
        console.error("Error logging in");
      }
    } catch (error) {
      setError(error);
      console.error("Error sending data:", error);
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
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color="black"
              style={{ paddingTop: 20 }}
            />
            {error && (
              <View
                style={{
                  gap: 10,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "pink",
                }}
              >
                <Ionicons name="alert-outline" size={24} color="red" />
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {error.response?.data?.message || "Login failed"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.view}>
            <Image source={voteImg} style={{ width: 300, height: 300 }} />
            <View style={styles.outerContainer}>
              <View>
                <Text style={styles.title}>Log into your Account</Text>
                <Text style={styles.text}>
                  Username
                  <Asterisk />
                </Text>
              </View>
              <TextInput
                placeholder=""
                value={username}
                onChangeText={setUsername}
                keyboardType="default"
                style={styles.input}
              />
            </View>
            <View style={styles.outerContainer}>
              <View>
                <Text style={styles.text}>
                  Password
                  <Asterisk />
                </Text>
              </View>
              <TextInput
                placeholder=""
                value={password}
                onChangeText={setPassword}
                keyboardType="default"
                style={styles.input}
                secureTextEntry={true}
              />
            </View>
          </View>
        </ScrollView>
        <Button
          text={
            isLoading ? (
              <ActivityIndicator
                size="small"
                color="#E8612D"
                style={styles.loader}
              />
            ) : (
              "Log In"
            )
          }
          disabled={!isFilled}
          buttonStyle={[
            {
              position: "absolute",
              bottom: 20,
              marginLeft: 20,
              width: "105%",
              left: "-2.5%",
            },
            (!isFilled || isLoading) && {
              backgroundColor: "#DADADA",
            },
          ]}
          handlePress={handleSubmit}
        />

        {/* <Privacy /> */}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 100,
  },
  scroll: {
    flex: 1,
  },
  view: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    // height: 700,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingBottom: 20,
    textAlign: "center",
    color: "#E8612D",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#868686",
    paddingVertical: 8,
  },
  outerContainer: {
    marginBottom: 16,
    width: "100%",
  },
  text: {
    fontSize: 16,
    fontWeight: "regular",
    color: "gray",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#DADADA",
    backgroundColor: "white",
    borderRadius: 4,
    fontSize: 16,
    // marginTop: 5,
  },
  loader: {
    alignSelf: "center",
  },
});
