import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Camera as ExpoCamera } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";

import Button from "@/components/button";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";

export default function ElectionId() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState(ExpoCamera.Constants.Type.front);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize TensorFlow
  useEffect(() => {
    const initTF = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow initialized");
      } catch (error) {
        console.error("TensorFlow initialization error:", error);
      }
    };
    initTF();
  }, []);

  // Request camera permission
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoCamera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (err) {
        console.error("Error requesting camera permission:", err);
        setHasPermission(false);
      }
    })();
  }, []);

  const getFaceData = async (userid) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const response = await axios.get(`${baseUrl}/api/face/${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (response.data?.image) {
        // Store the image data for later comparison
        await AsyncStorage.setItem("referenceImage", response.data.image);
        console.log("Reference image stored successfully");
      } else {
        console.error("No face data found in response");
      }
    } catch (error) {
      console.error("Error fetching face data:", error);
      setError("Failed to load reference face data");
    }
  };

  const captureAndVerifyFace = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    setVerificationStatus(null);

    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true,
      });

      // Resize image
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      // For now, just simulate verification
      // In a real implementation, you would compare the captured image with the stored reference
      const simulateVerification = Math.random() > 0.3; // 70% success rate for testing

      setVerificationStatus(simulateVerification ? "verified" : "failed");

      if (simulateVerification) {
        router.push("/electionId/confirm");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const checkLoginStatusAndFetchUser = async () => {
    setIsLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/index2");
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        if (!response.data?.user) {
          throw new Error("Invalid user data structure");
        }
        setUser(response.data.user);
        await getFaceData(response.data.user.userid);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.multiRemove(["token", "isUserVerified"]);
        router.replace("/index2");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

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
            {hasPermission ? (
              <ExpoCamera
                ref={cameraRef}
                style={[StyleSheet.absoluteFill, styles.camera]}
                type={cameraType}
                onCameraReady={() => setIsCameraReady(true)}
                ratio="1:1"
              />
            ) : (
              <View style={styles.permissionContainer}>
                <Text>Camera permission is required</Text>
                <Button
                  text="Grant Permission"
                  handlePress={async () => {
                    const { status } =
                      await ExpoCamera.requestCameraPermissionsAsync();
                    setHasPermission(status === "granted");
                  }}
                />
              </View>
            )}
            {isProcessing && (
              <View style={styles.faceDetectionBox}>
                <ActivityIndicator size="large" color="#e8612d" />
                <Text style={styles.faceDetectionText}>Detecting face...</Text>
              </View>
            )}
          </View>

          {verificationStatus === "verified" && (
            <Text style={styles.successText}>Verification successful!</Text>
          )}
          {verificationStatus === "failed" && (
            <Text style={styles.errorText}>
              Verification failed. Please try again.
            </Text>
          )}
          {verificationStatus === "error" && (
            <Text style={styles.errorText}>Error during verification.</Text>
          )}

          <Text style={styles.direction}>
            Place the device at the height of your face and do not move
          </Text>
          <Button
            text={isProcessing ? "PROCESSING..." : "VERIFY FACE"}
            buttonStyle={{
              elevation: 20,
              backgroundColor: isProcessing ? "#FAB09B" : "#FDD8CD",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
            }}
            handlePress={captureAndVerifyFace}
            disabled={isProcessing || !isCameraReady}
          />
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  innerContainer: {
    alignItems: "center",
    gap: 20,
  },
  rectangle: {
    width: "100%",
    height: 400,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  direction: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successText: {
    color: "green",
    marginBottom: 10,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontWeight: "bold",
  },
  faceDetectionBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 10,
  },
  faceDetectionText: {
    color: "white",
    marginTop: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
