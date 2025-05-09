import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  StatusBar,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Button from "../../components/button";
import { useFormStore } from "../../components/store";
import { baseUrl } from "../baseUrl";
import axios from "axios";
import { Alert } from "react-native";

export default function signup2() {
  const router = useRouter();
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const { pinId } = useFormStore();

  const handleChange = (text, index) => {
    if (text.length > 1) text = text[text.length - 1]; // Only allow 1 digit
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if there is text
    if (text && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
    }

    //auto submit if all inputs are filled
    if (index === inputRefs.length - 1 && text) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 5) {
        verifyOtp(fullOtp);
      }
    }
  };

  // Handle backspace navigation between inputs
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle resend OTP
  const resendOtp = async () => {
    try {
      setIsLoading(true);
      const phoneNumber = useFormStore.getState().formData.phone;
      const res = await axios.post(`${baseUrl}/api/auth/sendOTP`, {
        phoneNumber,
      });
      setTimer(60); // Reset timer
      Alert.alert("OTP Resent", "A new OTP has been sent to your phone.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  //handle verify OTP
  const verifyOtp = async (otpCode = otp.join("")) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${baseUrl}/api/auth/verifyOTP`, {
        pinId,
        otp: otpCode,
      });

      if (res.data.verified) {
        setOtpVerified(true);
        Alert.alert("Success", "Your account has been verified!");
        router.push("/signup3"); // Navigate to next screen
      } else {
        Alert.alert("Invalid OTP", "The code you entered is incorrect.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //handles timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const isButtonDisabled = otp.some((digit) => !digit) || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons
          name="arrow-back-outline"
          size={24}
          color="black"
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <Text style={styles.heading}>Enter OTP Code</Text>
      <Text style={styles.subheading}>
        Check your messages. We’ve sent a five digit OTP code to your number.
        Enter the coder below to verify your account and continue.
      </Text>
      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={[styles.input, value ? styles.filledInput : {}]}
            keyboardType="numeric"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>
      <Text style={styles.resendText}>
        You can resend in <Text style={styles.timer}>43</Text> seconds
      </Text>
      <Text style={styles.resendCode}>Resend Code</Text>
      <Button
        text="Continue"
        disabled={isButtonDisabled}
        buttonStyle={
          isButtonDisabled
            ? styles.buttonDisabled
            : {
                position: "absolute",
                bottom: 20,
                marginLeft: 20,
              }
        }
        handlePress={verifyOtp}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    marginBottom: 30,
    lineHeight: 25,
    color: "gray",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 5,
  },
  filledInput: {
    borderColor: "#E8612D",
  },
  resendText: {
    marginTop: 20,
    fontSize: 14,
    color: "gray",
    marginVertical: 20,
  },
  timer: {
    color: "#E8612D",

    fontWeight: "bold",
  },
  resendCode: {
    color: "#E8612D",
    fontWeight: "bold",
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: "#DADADA",
    position: "absolute",
    bottom: 20,
    marginLeft: 20,
  },
});
