import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import image from "@/assets/images/success.png";
import Button from "@/components/button";

export default function electionId() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.receiptCard}>
          <View style={styles.successCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark-sharp" size={48} color="white" />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.electionTitle}>2025 LCU Elections</Text>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>18/05/2025 2:20 PM</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Student</Text>
                <Text style={styles.value}>Olakunke John Faheed</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Voted for</Text>
                <Text style={styles.value}>John Doe Ronaldo</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Post</Text>
                <Text style={styles.value}>Student Representative</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Ref. No.</Text>
                <Text style={[styles.value, styles.refNo]}>A1287B56</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.footerText}>Vote recorded securely</Text>
            </View>
          </View>
        </View>

        <Button
          text="RETURN TO HOME"
          buttonStyle={styles.homeButton}
          textStyle={styles.buttonText}
          handlePress={() => router.replace("/(tabs)/home")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  receiptCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 100,
    alignItems: "center",
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FDD8CD",
    marginTop: -48,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8612D",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    padding: 24,
    paddingTop: 16,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 16,
  },
  divider: {
    height: 2,
    backgroundColor: "#E8612D",
    opacity: 0.2,
    width: "100%",
    borderRadius: 1,
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  refNo: {
    color: "#E8612D",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
  },
  footerText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  homeButton: {
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
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
