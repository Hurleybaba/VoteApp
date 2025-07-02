import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../baseUrl";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from "@/constants/theme";

const Upload = () => {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Gallery picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera permission to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      // Create FormData
      const formData = new FormData();

      // Generate a proper filename with timestamp
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.jpg`;

      formData.append("profile_picture", {
        uri: image,
        name: fileName,
        type: "image/jpeg",
      });

      const response = await fetch(`${baseUrl}/api/general/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      Alert.alert("Success", "Profile picture updated successfully", [
        { text: "OK", onPress: () => router.replace("/(tabs)/menu") },
      ]);
    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.secondary.default}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Update Profile Picture</Text>
      </View>

      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="person"
              size={80}
              color={COLORS.neutral.gray[400]}
            />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Ionicons
            name="images-outline"
            size={24}
            color={COLORS.neutral.white}
          />
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto} style={styles.button}>
          <Ionicons
            name="camera-outline"
            size={24}
            color={COLORS.neutral.white}
          />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            onPress={uploadImage}
            style={[styles.button, styles.uploadButton]}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.neutral.white} />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color={COLORS.neutral.white}
                />
                <Text style={styles.buttonText}>Upload Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray[200],
  },
  backButton: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary.default,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  placeholderContainer: {
    width: 300,
    height: 300,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.gray[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral.gray[200],
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: SPACING.md,
    color: COLORS.neutral.gray[500],
    fontSize: TYPOGRAPHY.sizes.md,
  },
  buttonContainer: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.primary.default,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  uploadButton: {
    backgroundColor: COLORS.secondary.default,
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default Upload;
