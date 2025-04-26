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
            <View style={styles.processImg}>
              <Text style={styles.number}>4</Text>
            </View>
            <Text style={styles.processText}>Confirm Vote</Text>
          </View>
          <View style={styles.brokenLine}></View>
        </View>
        <Text style={styles.topic}>
          Are you sure you want to vote for this candidate? Once confirmed, this
          action cannot be undone.
        </Text>
        <View style={styles.innerContainer}>
          <View style={styles.rectangle}></View>
          <View style={styles.circle}>
            <Image source={image} style={styles.image} />
          </View>
          <Text style={styles.name}>John Doe Ronaldo</Text>
        </View>
        <View style={styles.innerContainer}>
          <Button
            text="CONFIRM"
            buttonStyle={{
              elevation: 5,
              backgroundColor: "#E8612D",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "white",
            }}
            handlePress={() => {
              router.replace("/electionId/success");
            }}
          />
          <Button
            text="CANCEL"
            buttonStyle={{
              backgroundColor: "white",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#E8612D",
            }}
            handlePress={() => {
              router.replace("/(tabs)/news");
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
    padding: 10,
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  rectangle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 310,
    height: 180,
    borderRadius: 20,
    elevation: 15,
    backgroundColor: "#FDD8CD",
    top: 100,
  },
  circle: {
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#E8612D",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 26,
  },
});
