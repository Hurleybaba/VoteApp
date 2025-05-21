import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  TouchableOpacity,
} from "react-native";
import { CameraView, CameraType } from "expo-camera";
import * as Camera from "expo-camera";

import * as Device from "expo-device";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as FileSystem from "expo-file-system";
import { useRouter, useLocalSearchParams } from "expo-router";
import { baseUrl } from "../baseUrl.js";

import { useFormStore } from "../../components/store";

export default function kycpg2() {
  // const { Camera, CameraType } = CameraModule;
  const router = useRouter();
  const params = useLocalSearchParams();
  const userid = params.userid;

  const { setIsVerified } = useFormStore();

  if (!userid) {
    return (
      <View style={styles.center}>
        <Text>User ID not provided</Text>
      </View>
    );
  }
  console.log("User ID:", userid);

  const [hasPermission, setHasPermission] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // CORRECTED LINE: Access the nested 'Camera' property
        const { status } = await Camera.Camera.requestCameraPermissionsAsync();
        console.log("Camera permission status:", status);
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting camera permissions:", error);
        setHasPermission(false);
      }
    })();
  }, []);

  const captureAndUpload = async () => {
    if (!cameraRef.current || isUploading) return;

    setIsUploading(true);
    setUploadStatus("Capturing image...");

    try {
      // 1. Capture image
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, // Good balance between quality and size
        base64: false, // We'll use the file URI directly
      });

      setUploadStatus("Processing image...");

      // 2. Read the image file
      const base64Data = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Prepare payload
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      const payload = {
        image: dataUrl,
        timestamp: new Date().toISOString(),
        metadata: {
          deviceType: "mobile",
          deviceOS: Platform.OS,
          deviceModel: Device.modelName,
          resolution: photo.width + "x" + photo.height,

          // Add any other relevant metadata
        },
      };

      setUploadStatus("Uploading to server...");

      const token = await AsyncStorage.getItem("token");

      console.log("Token from getAuthToken:", token);

      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // 4. Send to backend
      const response = await axios.post(
        `${baseUrl}/api/face/${userid}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000, // 20 seconds timeout
        }
      );

      if (response.data.success) {
        setUploadStatus("Success!");
        Alert.alert(
          "Success",
          "Face data stored successfully!\nFace ID: " + response.data.face_id
        );
        router.push("/(tabs)/home");
      } else {
        throw new Error(response.data.message || "Server rejected the data");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Upload failed");

      let errorMessage = "Failed to upload face data.";

      // Check for Axios error response with status code
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          // Token is invalid or unauthorized
          AsyncStorage.removeItem("token"); // Clear the invalid token
          errorMessage =
            "Your session has expired or is invalid. Please log in again.";
          Alert.alert("Session Expired", errorMessage, [
            {
              text: "OK",
              onPress: () => router.replace("/login"), // Redirect to your login screen
            },
          ]);
          return; // Stop further execution in this catch block
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server Error: ${error.response.status}`;
        }
      } else if (error.code === "ECONNABORTED") {
        // Axios timeout error
        errorMessage =
          "Request timed out. Please check your network or try again.";
      } else if (error.message) {
        // Generic error message
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsVerified(true);
      setIsUploading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8612D" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission denied</Text>
        <Text style={styles.hintText}>
          Please enable camera permissions in settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        ratio="16:9"
      >
        <View style={styles.faceFrame}>
          <View style={styles.frameCornerTL} />
          <View style={styles.frameCornerTR} />
          <View style={styles.frameCornerBL} />
          <View style={styles.frameCornerBR} />
        </View>
      </CameraView>

      <View style={styles.controls}>
        <Text style={styles.statusText}>{uploadStatus}</Text>

        <Button
          title={isUploading ? "Processing..." : "Capture Face Data"}
          onPress={captureAndUpload}
          disabled={isUploading}
          color="#E8612D"
        />
      </View>

      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E8612D" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    color: "#E8612D",
    fontSize: 18,
    marginBottom: 10,
  },
  hintText: {
    color: "#666",
    textAlign: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  faceFrame: {
    position: "absolute",
    alignSelf: "center",
    top: "20%",
    width: "70%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "rgba(232, 97, 45, 0.5)",
    borderRadius: 10,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  frameCornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: "#E8612D",
  },
  frameCornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: "#E8612D",
  },
  frameCornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#E8612D",
  },
  frameCornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#E8612D",
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  statusText: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});
