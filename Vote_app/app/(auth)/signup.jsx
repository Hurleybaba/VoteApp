import {
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Input from "../../components/input";
import Button from "../../components/button";
import { useFormStore } from "../../components/store";

export default function signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [isFilled, setIsFilled] = useState(false);

  const setFormData = useFormStore((state) => state.setFormData);
  const formData = useFormStore((state) => state.formData);

  const handleSubmit = () => {
    setFormData({
      firstName,
      lastName,
      middleName,
      username,
      email,
      number,
    });

    console.log(formData);
    // Example: Navigate to the next screen
    router.push("/signup2");
  };

  const checkInputFilled = () => {
    if (
      firstName.trim() === "" ||
      lastName.trim() === "" ||
      middleName.trim() === "" ||
      username.trim() === "" ||
      email.trim() === "" ||
      number.trim() === ""
    ) {
      setIsFilled(false);
    } else {
      setIsFilled(true);
    }
  };

  useEffect(() => {
    checkInputFilled();
  }, [firstName, lastName, middleName, username, email, number]);

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

          <Text style={styles.heading}>Add your Personal Info</Text>
          <Text style={styles.subheading}>
            Make sure to fill all available fields
          </Text>
          <Input
            name="First Name"
            placeholder="Ex. John"
            value={firstName}
            onChangeText={setFirstName}
            keyboardType="default"
          />
          <Input
            name="Last Name"
            placeholder="Ex. Doe"
            value={lastName}
            onChangeText={setLastName}
            keyboardType="default"
          />
          <Input
            name="Middle Name"
            placeholder="Ex. Smith"
            value={middleName}
            onChangeText={setMiddleName}
            keyboardType="default"
          />
          <Input
            name="Preferred Username"
            placeholder="JohnDoe"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
          />
          <Input
            name="Email"
            placeholder="John@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            name="Phone Number"
            placeholder="070XXXXXXXX"
            value={number}
            onChangeText={setNumber}
            keyboardType="numeric"
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
