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
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button";

export default function electionId() {
  const router = useRouter();
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
              <View style={styles.circle}></View>
            </View>
          </View>
          <Text style={styles.direction}>
            Place the device at the height of your face and do not move
          </Text>
          <Button
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
});
