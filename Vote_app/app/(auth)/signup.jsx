import {
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Keyboard,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

import Input from "../../components/input";
import Button from "../../components/button";
import { useFormStore } from "../../components/store";
import { baseUrl } from "../baseUrl";

export default function signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  const { setFormData } = useFormStore();

  // Form state

  //Form Validation
  const [error, setError] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfFilled = () => {
    if (
      firstname.trim() &&
      lastname.trim() &&
      middlename.trim() &&
      age.trim() &&
      username.trim() &&
      email.trim() &&
      phone.trim()
    ) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!firstname.trim()) {
      newErrors.firstname = "First name is required";
      isValid = false;
    }
    if (!lastname.trim()) {
      newErrors.lastname = "Last name is required";
      isValid = false;
    }
    if (!middlename.trim()) {
      newErrors.middlename = "Middle name is required";
      isValid = false;
    }
    if (!age.trim()) {
      newErrors.age = "Age is required";
      isValid = false;
    } else if (isNaN(age)) {
      newErrors.age = "Age must be a number";
      isValid = false;
    }
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
      isValid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (isNaN(phone)) {
      newErrors.phone = "Phone number must be a number";
      isValid = false;
    } else if (phone.length !== 11) {
      newErrors.phone = "Phone number must be exactly 11 digits";
      isValid = false;
    }
    setError(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const formatNumber = (number) => {
    number = number.trim().replace(/[^0-9]/g, ""); // Remove non-numeric characters

    if (number.startsWith("0")) {
      return "+234" + number.slice(1); // Replace leading 0 with +234
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError({});

    setFormData({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      middlename: middlename.trim(),
      age: age.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    try {
      const res = await axios.post(
        `http://192.168.8.101:3000/api/auth/sendEmail`,
        {
          email: email.trim(),
        }
      );

      if (res.data.success) {
        Alert.alert("OTP Sent", "Check your email for the verification code.");
        router.push("/signup2");
      } else {
        Alert.alert("Error", res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);

      let errorMessage = "Failed to send OTP. Please try again.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkIfFilled();
    validateForm();
  }, [firstname, lastname, middlename, age, username, email, phone]);

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
            value={firstname}
            onChangeText={setFirstname}
            keyboardType="default"
            error={error.firstname}
            showErrors={showErrors}
          />
          <Input
            name="Last Name"
            placeholder="Ex. Doe"
            value={lastname}
            onChangeText={setLastname}
            keyboardType="default"
            error={error.lastname}
            showErrors={showErrors}
          />
          <Input
            name="Middle Name"
            placeholder="Ex. Smith"
            value={middlename}
            onChangeText={setMiddlename}
            keyboardType="default"
            error={error.middlename}
            showErrors={showErrors}
          />
          <Input
            name="Age"
            placeholder="23"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            error={error.age}
            showErrors={showErrors}
          />
          <Input
            name="Preferred Username"
            placeholder="JohnDoe"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            error={error.username}
            showErrors={showErrors}
          />
          <Input
            name="Email"
            placeholder="John@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={error.email}
            showErrors={showErrors}
          />
          <Input
            name="Phone Number"
            placeholder="070XXXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            error={error.phone}
            showErrors={showErrors}
          />
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
              "Continue"
            )
          }
          disabled={!isFilled || isLoading}
          buttonStyle={[
            styles.button,
            (!isFilled || isLoading) && styles.buttonDisabled,
          ]}
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
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#E8612D",
  },
  buttonDisabled: {
    backgroundColor: "#DADADA",
  },
  loader: {
    alignSelf: "center",
  },
});
