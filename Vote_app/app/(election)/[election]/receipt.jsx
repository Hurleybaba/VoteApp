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

import image from "@/assets/images/success.png";
import Button from "@/components/button";
import { Ionicons } from "@expo/vector-icons";

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
        <Text style={styles.topic}>Receipt</Text>

        <View style={styles.innerContainer}>
          <View style={styles.circle}>
            <Ionicons name="checkmark-outline" size={48} color="white" />
          </View>
          <Text style={styles.small}>2025 LCU Elections</Text>
          <View style={styles.heading}>
            <Text style={styles.left}>Date</Text>
            <Text style={styles.right}>18/05/2025 2:20 PM</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.left}>Student</Text>
            <Text style={styles.right}>Olakunke John Faheed</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.left}>Voted for</Text>
            <Text style={styles.right}>John Doe Ronaldo</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.left}>Post</Text>
            <Text style={styles.right}>Student Representative</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.left}>Ref. No.</Text>
            <Text style={styles.right}>A1287B56</Text>
          </View>
        </View>
        <Button
          text="BACK TO HOME SCREEN"
          buttonStyle={{
            elevation: 5,
            backgroundColor: "#E8612D",
            marginTop: 30,
          }}
          textStyle={{
            fontSize: 18,
            fontWeight: "bold",
            color: "white",
          }}
          handlePress={() => {
            router.replace("/(tabs)/home");
          }}
        />
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
  topic: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#E8612D",
    textAlign: "center",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    marginTop: 120,
    elevation: 20,
    borderRadius: 10,
    backgroundColor: "white",
    paddingBottom: 40,
  },
  small: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderColor: "#E8612D",
    borderStyle: "dashed",
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
  },
  circle: {
    width: 80,
    height: 80,
    position: "absolute",
    backgroundColor: "#E8612D",
    borderRadius: 40,
    top: -40,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    width: "90%",
    alignSelf: "center",
  },
});
