import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button";
import { CameraView } from "expo-camera";
import { useCamera } from "@/hooks/useCamera";
import http from "@/utils/http";

export default function electionId() {
  const router = useRouter();
  const { cameraRef, processImage } = useCamera();
  const [submitting, setSubmitting] = useState(false);

  const { electionId, candidateId } = useLocalSearchParams();

  const handleContinue = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      console.log("Starting face verification process");
      const { dataUrl } = await processImage();
      console.log("Image processed successfully");

      console.log("Sending verification request to server");
      const { data } = await http.post("/api/face/vote/verify", {
        image: dataUrl,
      });
      console.log("Server response received:", data);

      if (data.data.Similarity > 80) {
        console.log(
          "Face verification successful, redirecting to confirm page"
        );
        return router.replace({
          pathname: `/(election)/${electionId}/confirm`,
          params: {
            electionId: electionId,
            candidateId: candidateId,
          },
        });
      }

      // Handle low similarity score
      Alert.alert(
        "Face Verification Failed",
        "The face detected doesn't match your registered face. Please try again with better lighting and make sure your face is clearly visible.",
        [
          {
            text: "Try Again",
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error("Face verification error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Unable to complete facial recognition.";
      let errorTitle = "Verification Error";

      if (error.response?.data) {
        const { errorType, message, details } = error.response.data;
        console.log("Error type:", errorType);
        console.log("Error message:", message);
        console.log("Error details:", details);

        switch (errorType) {
          case "NO_IMAGE":
            errorTitle = "No Image";
            errorMessage =
              "Please ensure your face is clearly visible in the camera.";
            break;
          case "INVALID_FORMAT":
            errorTitle = "Invalid Image";
            errorMessage =
              "The image format is not supported. Please try again.";
            break;
          case "IMAGE_TOO_LARGE":
            errorTitle = "Image Too Large";
            errorMessage = "The image size is too large. Please try again.";
            break;
          case "NO_MATCH":
            errorTitle = "No Face Match";
            errorMessage =
              "No matching face was found. Please ensure your face is clearly visible and try again.";
            break;
          case "LOW_SIMILARITY":
            errorTitle = "Low Similarity";
            errorMessage =
              "The face detected doesn't match your registered face. Please try again with better lighting.";
            break;
          case "REKOGNITION_ERROR":
            errorTitle = "Verification Failed";
            errorMessage =
              "Face verification failed. Please ensure your face is clearly visible and try again.";
            break;
          case "SERVER_ERROR":
            errorTitle = "Server Error";
            errorMessage = "An unexpected error occurred. Please try again.";
            break;
          default:
            errorTitle = "Verification Error";
            errorMessage =
              message ||
              "Please try again with better lighting and make sure your face is clearly visible.";
        }

        // Handle specific HTTP status codes
        if (error.response.status === 404) {
          errorTitle = "Face Data Not Found";
          errorMessage = "Please complete your KYC verification first.";
          router.replace("/(tabs)/home");
          return;
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          errorTitle = "Session Expired";
          errorMessage = "Please log in again to continue.";
          router.replace("/index2");
          return;
        }
      } else if (error.code === "ECONNABORTED") {
        errorTitle = "Connection Timeout";
        errorMessage =
          "The request took too long. Please check your internet connection and try again.";
      }

      Alert.alert(errorTitle, errorMessage, [
        {
          text: "Try Again",
          style: "default",
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, processImage, electionId, candidateId, router]);

  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
          </TouchableOpacity>
          <Text style={styles.heading}>Vote for Student Representative</Text>
        </View>
        <View style={styles.processes}>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>1</Text>
            </View>
            <Text style={styles.processText}>Choose Candidate</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>2</Text>
            </View>
            <Text style={styles.processText}>ID Validation</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg}>
              <Text style={styles.number}>3</Text>
            </View>
            <Text style={styles.processText}>Facial Recognition</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg2}>
              <Text style={styles.number2}>4</Text>
            </View>
            <Text style={styles.processText}>Confirm Vote</Text>
          </View>
          <View style={styles.brokenLine}></View>
        </View>
        <Text style={styles.topic}>Facial recognition</Text>
        <View style={styles.innerContainer}>
          <View style={styles.rectangle}>
            <View style={styles.outerCircle}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
                // ratio="16:9"
              >
                <View style={styles.circle}></View>
              </CameraView>
            </View>
          </View>
          <Text style={styles.direction}>
            Place the device at the height of your face and do not move
          </Text>
          <Button
            text={submitting ? "Verifying..." : "CONTINUE"}
            buttonStyle={{
              elevation: 20,
              backgroundColor: submitting ? "#FDD8CD" : "#E8612D",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
            }}
            handlePress={() => {
              handleContinue();
            }}
          ></Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    padding: 10,
    height: "100%",
  },
  up: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8612D",
  },
  processes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 30,
    marginBottom: 24,
  },
  process: {
    width: 60,
    alignItems: "center",
    gap: 5,
  },
  processImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
  },
  processImg2: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FAB09B",
    justifyContent: "center",
    alignItems: "center",
  },
  processText: {
    fontSize: 12,
    textAlign: "center",
  },
  number: {
    fontWeight: "bold",
    color: "white",
  },
  number2: {
    fontWeight: "bold",
  },
  brokenLine: {
    borderBottomWidth: 1,
    position: "absolute",
    borderStyle: "dashed",
    borderColor: "#FAB09B",
    top: 5,
    width: "100%",
    height: 10,
    zIndex: -1,
  },
  topic: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 600,
    textAlign: "left",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rectangle: {
    justifyContent: "center",
    alignItems: "center",
    width: 310,
    height: 310,
    borderWidth: 3,
    borderColor: "#E8612D",
    marginVertical: 30,
  },
  outerCircle: {
    justifyContent: "center",
    alignItems: "center",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "white",
  },
  circle: {
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: "#E8612D",
  },
  direction: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 26,
  },

  camera: {
    borderRadius: 150,
  },
});
