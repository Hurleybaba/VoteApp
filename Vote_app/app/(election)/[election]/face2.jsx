import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

const FaceVerificationScreen = () => {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Camera permission status:", status);
      setHasPermission(status === "granted");

      // Load the reference image
      try {
        const savedImage = await AsyncStorage.getItem("capturedFace");
        if (savedImage) {
          setReferenceImage(savedImage);
        } else {
          setError("Reference image not found");
        }
      } catch (err) {
        console.error("Error loading reference image:", err);
        setError("Failed to load reference image");
      }
    })();
  }, []);

  const verifyFace = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    setVerificationStatus(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });

      // For demo purposes, we'll consider it verified
      // In a real app, you would compare the photos using a face comparison API
      setVerificationStatus("verified");
      await AsyncStorage.setItem("isVerified", "true");
      router.push("/electionId/confirm");
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E8612D" />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>
          No access to camera. Please grant camera permission to continue.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        <Text style={styles.topic}>Face Verification</Text>
        <View style={styles.innerContainer}>
          {referenceImage && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceText}>Reference Photo:</Text>
              <Image
                source={{ uri: `data:image/jpeg;base64,${referenceImage}` }}
                style={styles.referenceImage}
              />
            </View>
          )}

          <View style={styles.rectangle}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              type={CameraType.front}
              enableZoomGesture={false}
            />

            {isProcessing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E8612D" />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            )}

            <View style={styles.captureGuide}>
              <View style={[styles.guideLine, styles.guideLineHorizontal]} />
              <View style={[styles.guideLine, styles.guideLineVertical]} />
              <View style={styles.faceOutline} />
            </View>
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
            Position your face within the circle and look directly at the camera
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#E8612D",
              },
            ]}
            onPress={verifyFace}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? "VERIFYING..." : "VERIFY FACE"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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
  topic: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
  },
  referenceContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  referenceText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  referenceImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E8612D",
  },
  rectangle: {
    width: "100%",
    height: 400,
    borderWidth: 3,
    borderColor: "#E8612D",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  direction: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  successText: {
    color: "#4CD964",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  captureGuide: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  guideLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  guideLineHorizontal: {
    left: "25%",
    right: "25%",
    height: 1,
    top: "50%",
  },
  guideLineVertical: {
    top: "25%",
    bottom: "25%",
    width: 1,
    left: "50%",
  },
  faceOutline: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#E8612D",
    borderStyle: "dashed",
  },
});

export default FaceVerificationScreen;
