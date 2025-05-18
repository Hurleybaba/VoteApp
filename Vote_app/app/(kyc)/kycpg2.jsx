import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import axios from "axios";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button.jsx";

export default function kycpg2() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");

        // Check if Camera is properly initialized
        if (!Camera || !Camera.Constants) {
          throw new Error("Camera module not properly initialized");
        }
        setIsCameraReady(true);
      } catch (error) {
        console.error("Camera permission error:", error);
        setHasPermission(false);
      }
    })();
  }, []);

  const captureLiveness = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      setCapturedImage(photo);

      //sending to the backend
      const fileName = `liveness_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Simulate verification - replace with actual API call
      const verified = true; // await verifyImage(fileUri);
      setIsVerified(verified);

      // Here you would typically send the fileUri to your backend
      console.log("Captured image saved to:", fileUri);
    } catch (error) {
      console.error("Liveness capture failed:", error);
      setIsVerified(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCameraType = () => {
    try {
      return Camera.Constants.Type.front;
    } catch (error) {
      console.warn("Camera.Constants not available, using string fallback");
      return "front"; // Fallback string value
    }
  };

  const router = useRouter();

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#E8612D" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text>
          No camera access. Please enable camera permissions in settings.
        </Text>
        <Button
          text="Open Settings"
          handlePress={() => Linking.openSettings()}
        />
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
          {capturedImage ? (
            <View style={styles.rectangle}>
              <Image
                source={{ uri: capturedImage.uri }}
                style={styles.circle}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.rectangle}>
              {isCameraReady ? (
                <Camera
                  style={styles.camera}
                  type={Camera.Constants.Type.front} // Use string directly as fallback
                  ratio="1:1"
                  ref={cameraRef}
                  onCameraReady={() => console.log("Camera ready")}
                >
                  <View style={styles.outerCircle}>
                    <View style={styles.circleOverlay}></View>
                  </View>
                </Camera>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <ActivityIndicator size="large" color="#E8612D" />
                  <Text>Initializing camera...</Text>
                </View>
              )}
            </View>
          )}
          {/* <View style={styles.rectangle}>
            <View style={styles.outerCircle}>
              <View style={styles.circle}></View>
            </View>
          </View> */}
          {/* <Text style={styles.direction}>
            Place the device at the height of your face and do not move
          </Text> */}
          <Text style={styles.direction}>
            {capturedImage
              ? "Image captured successfully!"
              : "Place the device at the height of your face and do not move"}
          </Text>
          {/* <Button
            text="CONTINUE"
            buttonStyle={{
              elevation: 20,
              backgroundColor: "#FDD8CD",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
            }}
            handlePress={() => {
              router.push("/electionId/confirm");
            }}
          /> */}
          {isProcessing ? (
            <ActivityIndicator size="large" color="#E8612D" />
          ) : capturedImage ? (
            <View style={styles.buttonGroup}>
              <Button
                text="RETRY"
                buttonStyle={{
                  backgroundColor: "#F5F5F5",
                  marginBottom: 10,
                }}
                textStyle={{
                  color: "#E8612D",
                }}
                handlePress={() => {
                  setCapturedImage(null);
                  setIsVerified(false);
                }}
              />
              <Button
                text={isVerified ? "CONTINUE" : "VERIFYING..."}
                buttonStyle={{
                  backgroundColor: isVerified ? "#E8612D" : "#FAB09B",
                }}
                textStyle={{
                  color: "white",
                }}
                handlePress={() => {
                  if (isVerified) {
                    router.push("/electionId/confirm");
                  }
                }}
                disabled={!isVerified}
              />
            </View>
          ) : (
            <Button
              text="CAPTURE"
              buttonStyle={{
                backgroundColor: "#E8612D",
              }}
              textStyle={{
                color: "white",
              }}
              handlePress={captureLiveness}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//     padding: 10,
//     height: "100%",
//   },
//   up: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 20,
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#E8612D",
//   },
//   processes: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10,
//     marginTop: 30,
//     marginBottom: 24,
//   },
//   process: {
//     width: 60,
//     alignItems: "center",
//     gap: 5,
//   },
//   processImg: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#E8612D",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   processImg2: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#FAB09B",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   processText: {
//     fontSize: 12,
//     textAlign: "center",
//   },
//   number: {
//     fontWeight: "bold",
//     color: "white",
//   },
//   number2: {
//     fontWeight: "bold",
//   },
//   brokenLine: {
//     borderBottomWidth: 1,
//     position: "absolute",
//     borderStyle: "dashed",
//     borderColor: "#FAB09B",
//     top: 5,
//     width: "100%",
//     height: 10,
//     zIndex: -1,
//   },
//   topic: {
//     paddingTop: 10,
//     fontSize: 18,
//     fontWeight: 600,
//     textAlign: "left",
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   rectangle: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 310,
//     height: 310,
//     borderWidth: 3,
//     borderColor: "#E8612D",
//     marginVertical: 30,
//   },
//   outerCircle: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 380,
//     height: 380,
//     borderRadius: 190,
//     backgroundColor: "white",
//   },
//   circle: {
//     alignSelf: "center",
//     width: 300,
//     height: 300,
//     borderRadius: 150,
//     borderWidth: 3,
//     borderColor: "#E8612D",
//   },
//   direction: {
//     fontSize: 14,
//     textAlign: "center",
//     fontWeight: "bold",
//     marginBottom: 26,
//   },
// });
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
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
  processes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 30,
    marginBottom: 24,
    position: "relative",
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
    top: 15,
    width: "100%",
    zIndex: -1,
  },
  cameraPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  topic: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "left",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  rectangle: {
    justifyContent: "center",
    alignItems: "center",
    width: 310,
    height: 310,
    borderWidth: 3,
    borderColor: "#E8612D",
    marginVertical: 30,
    overflow: "hidden",
  },
  camera: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    justifyContent: "center",
    alignItems: "center",
    width: 380,
    height: 380,
    borderRadius: 190,
  },
  circle: {
    width: "100%",
    height: "100%",
    borderRadius: 150,
  },
  circleOverlay: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: "#E8612D",
    backgroundColor: "transparent",
  },
  direction: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 26,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
});
