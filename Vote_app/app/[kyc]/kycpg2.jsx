import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { CameraView } from "expo-camera";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFormStore } from "../../components/store";
import { useCamera } from "@/hooks/useCamera.js";
import http from "@/utils/http.js";

export default function KycFaceRegistration() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userid = params.userid;
  const { setIsVerified } = useFormStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showTips, setShowTips] = useState(false);
  const { cameraRef, hasPermission, processImage } = useCamera();

  if (!userid) {
    return (
      <View style={styles.center}>
        <Text>User ID not provided</Text>
      </View>
    );
  }

  const captureAndUpload = async () => {
    if (!cameraRef.current || isUploading) return;
    setIsUploading(true);
    setUploadStatus("Capturing image...");
    try {
      const { photo, dataUrl } = await processImage();
      setUploadStatus("Processing image...");
      const payload = {
        image: dataUrl,
        timestamp: new Date().toISOString(),
        metadata: {
          deviceType: "mobile",
          deviceOS: Platform.OS,
          deviceModel: Device.modelName,
          resolution: photo.width + "x" + photo.height,
        },
      };
      setUploadStatus("Uploading to server...");
      const response = await http.post(`/api/face/${userid}`, payload);
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
      setUploadStatus("Upload failed");
      let errorMessage = "Failed to upload face data.";
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          AsyncStorage.removeItem("token");
          errorMessage =
            "Your session has expired or is invalid. Please log in again.";
          Alert.alert("Session Expired", errorMessage, [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]);
          return;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server Error: ${error.response.status}`;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. Please check your network or try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsVerified(true);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#E8612D" />
          <Text style={styles.loadingText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <View style={styles.errorContent}>
          <Ionicons name="camera-off" size={80} color="#E8612D" />
          <Text style={styles.errorTitle}>Camera Permission Required</Text>
          <Text style={styles.errorText}>
            Please enable camera permissions in your device settings to register
            your face.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Registration</Text>
        <View style={styles.placeholder} />
      </View>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          ratio="16:9"
        >
          {/* Face Frame Overlay */}
          <View style={styles.faceFrame}>
            <View style={styles.frameCornerTL} />
            <View style={styles.frameCornerTR} />
            <View style={styles.frameCornerBL} />
            <View style={styles.frameCornerBR} />
            {/* Center Dot */}
            <View style={styles.centerDot} />
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Position your face within the frame
              </Text>
              <Text style={styles.instructionsSubtext}>
                Ensure good lighting and look directly at the camera
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
      {/* Controls */}
      <View style={styles.controls}>
        {/* Status */}
        {uploadStatus && (
          <View style={styles.statusContainer}>
            <Ionicons
              name={
                uploadStatus.includes("Success")
                  ? "checkmark-circle"
                  : "information-circle"
              }
              size={20}
              color={uploadStatus.includes("Success") ? "#4caf50" : "#E8612D"}
            />
            <Text style={styles.statusText}>{uploadStatus}</Text>
          </View>
        )}
        {/* Tips */}
        <View style={styles.tipsContainer}>
          <TouchableOpacity
            style={styles.tipsHeader}
            onPress={() => setShowTips(!showTips)}
            activeOpacity={0.7}
          >
            <Text style={styles.tipsTitle}>Tips for best results</Text>
            <Ionicons
              name={showTips ? "chevron-up" : "chevron-down"}
              size={20}
              color="#E8612D"
            />
          </TouchableOpacity>
          {showTips && (
            <View style={styles.tipsContent}>
              <View style={styles.tipItem}>
                <Ionicons name="sunny" size={16} color="#E8612D" />
                <Text style={styles.tipText}>Ensure good lighting</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="eye" size={16} color="#E8612D" />
                <Text style={styles.tipText}>Look directly at the camera</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="hand-left" size={16} color="#E8612D" />
                <Text style={styles.tipText}>Keep your face steady</Text>
              </View>
            </View>
          )}
        </View>
        {/* Capture Button */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isUploading && styles.captureButtonDisabled,
          ]}
          onPress={captureAndUpload}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.captureButtonText}>Capture Face Data</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      {/* Loading Overlay */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#E8612D" />
            <Text style={styles.loadingOverlayText}>{uploadStatus}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    color: "#E8612D",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: "#E8612D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  faceFrame: {
    position: "absolute",
    alignSelf: "center",
    top: "15%",
    width: "75%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "rgba(232, 97, 45, 0.5)",
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  frameCornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: "#E8612D",
    borderTopLeftRadius: 20,
  },
  frameCornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: "#E8612D",
    borderTopRightRadius: 20,
  },
  frameCornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#E8612D",
    borderBottomLeftRadius: 20,
  },
  frameCornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#E8612D",
    borderBottomRightRadius: 20,
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 8,
    height: 8,
    backgroundColor: "#E8612D",
    borderRadius: 4,
    marginTop: -4,
    marginLeft: -4,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: -80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  instructionsSubtext: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.9)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(232, 97, 45, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8612D",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: "#E8612D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  captureButtonDisabled: {
    backgroundColor: "#666",
    shadowOpacity: 0,
    elevation: 0,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tipsTitle: {
    color: "#E8612D",
    fontSize: 16,
    fontWeight: "bold",
  },
  tipsContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 97, 45, 0.2)",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    color: "#ccc",
    fontSize: 14,
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  loadingCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  loadingOverlayText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
});
