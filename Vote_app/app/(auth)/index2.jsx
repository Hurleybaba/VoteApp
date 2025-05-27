import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import voteImg from "../../assets/images/Voting-amico.png";
import Button from "../../components/button";
import Privacy from "../../components/privacy";

export default function index2() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.imageBg}>
            <LinearGradient
              colors={["rgba(232, 97, 45, 0.1)", "rgba(232, 97, 45, 0)"]}
              style={styles.gradient}
            />
          </View>
          <Image source={voteImg} style={styles.image} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Let's get Started!</Text>
          <Text style={styles.subtitle}>
            Join our secure voting platform and make your voice heard
          </Text>
        </View>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.buttonContainer}>
        <Button
          text="Create Account"
          handlePress={() => router.push("/signup")}
          buttonStyle={styles.signupButton}
          textStyle={styles.signupButtonText}
        />
        <Button
          text="Log in"
          handlePress={() => router.push("/login")}
          buttonStyle={styles.loginButton}
          textStyle={styles.loginButtonText}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  imageBg: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    overflow: "hidden",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 400,
  },
  image: {
    width: 320,
    height: 320,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  signupButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8612D",
    shadowColor: "#E8612D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E8612D",
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E8612D",
  },
});
