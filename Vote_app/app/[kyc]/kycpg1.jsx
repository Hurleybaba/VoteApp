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
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Input from "../../components/input";
import Button from "../../components/button";
import { useFormStore } from "../../components/store";
import { baseUrl } from "../baseUrl";
import Picker from "../../components/picker";

export default function kycpg1() {
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [level, setLevel] = useState("");

  const router = useRouter();
  const params = useLocalSearchParams();
  const userid = params.userid;

  const { setKycData } = useFormStore();

  const faculties = ["Law", "Applied Sciences", "Pharmacy", "Medical Sciences"];

  // Form state

  //Form Validation
  const [error, setError] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfFilled = () => {
    if (
      department.trim() &&
      faculty.trim() &&
      matricNo.trim() &&
      level.trim()
    ) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!department.trim()) {
      newErrors.department = "Department is required";
      isValid = false;
    }
    if (!faculty.trim()) {
      newErrors.faculty = "Faculty is required";
      isValid = false;
    }
    if (!matricNo.trim()) {
      newErrors.matricNo = "Matric No is required";
      isValid = false;
    }
    if (!level.trim()) {
      newErrors.level = "Level is required";
      isValid = false;
    }
    if (level.trim() && isNaN(level)) {
      newErrors.level = "Level must be a number";
      isValid = false;
    }
    if (level.trim() && (level < 100 || level > 500)) {
      newErrors.level = "Level must be between 100 and 500";
      isValid = false;
    }
    if (
      matricNo.trim() &&
      !/^[A-Z]{3}\/[A-Z]{2}\/\d{2}\/\d{5}$/.test(matricNo)
    ) {
      newErrors.matricNo = "Matric No must be in the format LCU/UG/**/*****";
      isValid = false;
    }
    if (department.trim() && !/^[A-Za-z\s]+$/.test(department)) {
      newErrors.department = "Department must contain only letters";
      isValid = false;
    }
    if (faculty.trim() && !/^[A-Za-z\s]+$/.test(faculty)) {
      newErrors.faculty = "Faculty must contain only letters";
      isValid = false;
    }
    setError(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError({});

    setKycData({
      department: department.trim(),
      faculty: faculty.trim(),
      matricNo: matricNo.trim(),
      level: level.trim(),
    });

    const payload = {
      department: department.trim(),
      faculty: faculty.trim(),
      matricNo: matricNo.trim(),
      level: level.trim(),
    };

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/index2");
      return;
    }

    try {
      console.log("userid", userid);
      const res = await axios.post(
        `${baseUrl}/api/face/saa/${userid}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000, // 20 seconds timeout
        }
      );

      if (res.data.success) {
        Alert.alert("Success", "Details sent successfully!");
        console.log("Response data:", res.data);
        router.push({
          pathname: "/[kyc]/kycpg2",
          params: {
            userid: userid,
          },
        }); // Navigate to next screen
      } else {
        Alert.alert("Error", res.data.message || "Failed to send details");
      }
    } catch (err) {
      console.error("Full error:", err);

      let errorMessage = "Failed to send details. Please try again.";
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.response) {
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
  }, [department, faculty, matricNo, level]);

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

          <Text style={styles.heading}>Let's get you Verified</Text>
          <Text style={styles.subheading}>
            Make sure to fill all available fields
          </Text>
          <Input
            name="Department"
            placeholder="Computer Science"
            value={department}
            onChangeText={setDepartment}
            keyboardType="default"
            error={error.department}
            showErrors={showErrors}
          />
          <Picker
            name="Faculty"
            option1={faculties[0]}
            option2={faculties[1]}
            option3={faculties[2]}
            option4={faculties[3]}
            selectedOption={faculty}
            onValueChange={(c) => setFaculty(c)}
            error={error.faculty}
            showErrors={showErrors}
          />
          <Input
            name="Matric No"
            placeholder="LCU/UG/**/*****"
            value={matricNo}
            onChangeText={setMatricNo}
            keyboardType="default"
            error={error.matricNo}
            showErrors={showErrors}
          />
          <Input
            name="Current Level"
            placeholder="400"
            value={level}
            onChangeText={setLevel}
            keyboardType="numeric"
            error={error.level}
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
