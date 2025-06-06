import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";
import axios from "axios";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

const FaceDetectionScreen = () => {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = async () => {
    try {
      console.log("Requesting camera permission...");
      const { status: existingStatus } =
        await Camera.getCameraPermissionsAsync();
      console.log("Existing permission status:", existingStatus);

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        console.log("No existing permission, requesting...");
        const { status } = await Camera.requestCameraPermissionsAsync();
        finalStatus = status;
        console.log("New permission status:", status);
      }

      setHasPermission(finalStatus === "granted");
    } catch (err) {
      console.error("Error requesting camera permission:", err);
      setError("Failed to request camera permission");
      setHasPermission(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const captureAndSaveFace = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });

      await AsyncStorage.setItem("capturedFace", photo.base64);
      router.push("/123/face2");
    } catch (error) {
      console.error("Error capturing face:", error);
      setError("Failed to capture face");
    } finally {
      setIsCapturing(false);
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

        <Text style={styles.topic}>Face Registration</Text>
        <View style={styles.innerContainer}>
          <View style={styles.rectangle}>
            {hasPermission && (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
                ratio="16:9"
              />
            )}

            {isCapturing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E8612D" />
                <Text style={styles.loadingText}>Capturing...</Text>
              </View>
            )}

            <View style={styles.captureGuide}>
              <View style={[styles.guideLine, styles.guideLineHorizontal]} />
              <View style={[styles.guideLine, styles.guideLineVertical]} />
              <View style={styles.faceOutline} />
            </View>
          </View>

          <Text style={styles.direction}>
            Position your face within the circle and look directly at the camera
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#E8612D",
              },
            ]}
            onPress={captureAndSaveFace}
            disabled={isCapturing || !hasPermission}
          >
            <Text style={styles.buttonText}>
              {isCapturing ? "CAPTURING..." : "CAPTURE PHOTO"}
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
});

export default FaceDetectionScreen;
