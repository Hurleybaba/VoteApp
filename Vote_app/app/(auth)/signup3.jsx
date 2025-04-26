import {
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Input from "../../components/input";
import Button from "../../components/button";

export default function signup() {
  const handlePasswordChange = (text) => {};
  const handleConfirmPasswordChange = (text) => {};

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
            value=""
            onChangeText={handlePasswordChange}
            keyboardType="default"
          />
          <Input
            name="Confirm Password"
            placeholder="********"
            value=""
            onChangeText={handleConfirmPasswordChange}
            keyboardType="visible-password"
          />
        </ScrollView>
        <Button
          text="Continue"
          handlePress={() => {
            router.push("/(tabs)/home");
          }}
          buttonStyle={{
            position: "absolute",
            bottom: 20,
            marginLeft: 20,
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 20,
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
