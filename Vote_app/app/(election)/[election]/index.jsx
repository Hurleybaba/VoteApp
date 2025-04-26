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
            <View style={styles.processImg2}>
              <Text style={styles.number2}>2</Text>
            </View>
            <Text style={styles.processText}>ID Validation</Text>
          </View>
          <View style={styles.process}>
            <View style={styles.processImg2}>
              <Text style={styles.number2}>3</Text>
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
        <Text style={styles.choose}>Choose your preferred candidate</Text>
        <View style={styles.collection}>
          <View style={styles.candidate}>
            <View style={styles.top}>
              <View style={styles.candidateImg}>
                <Image style={styles.image} source={image} />
              </View>
              <View style={styles.right}>
                <Text style={styles.candidateName}>John Mary Martinex</Text>
                <Text style={styles.candidateDetails}>
                  I'll let your voice be heard and work towards the fulfillment
                  of your needs.
                </Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  router.push("/electionId/profile");
                }}
              >
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  router.push("/electionId/face");
                }}
              >
                <Text style={styles.buttonText2}>Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.candidate}>
            <View style={styles.top}>
              <View style={styles.candidateImg}>
                <Image style={styles.image} source={image} />
              </View>
              <View style={styles.right}>
                <Text style={styles.candidateName}>John Mary Martinex</Text>
                <Text style={styles.candidateDetails}>
                  I'll let your voice be heard and work towards the fulfillment
                  of your needs.
                </Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button2}>
                <Text style={styles.buttonText2}>Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.candidate}>
            <View style={styles.top}>
              <View style={styles.candidateImg}>
                <Image style={styles.image} source={image} />
              </View>
              <View style={styles.right}>
                <Text style={styles.candidateName}>John Mary Martinex</Text>
                <Text style={styles.candidateDetails}>
                  I'll let your voice be heard and work towards the fulfillment
                  of your needs.
                </Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button2}>
                <Text style={styles.buttonText2}>Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.candidate}>
            <View style={styles.top}>
              <View style={styles.candidateImg}>
                <Image style={styles.image} source={image} />
              </View>
              <View style={styles.right}>
                <Text style={styles.candidateName}>John Mary Martinex</Text>
                <Text style={styles.candidateDetails}>
                  I'll let your voice be heard and work towards the fulfillment
                  of your needs.
                </Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button2}>
                <Text style={styles.buttonText2}>Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.candidate}>
            <View style={styles.top}>
              <View style={styles.candidateImg}>
                <Image style={styles.image} source={image} />
              </View>
              <View style={styles.right}>
                <Text style={styles.candidateName}>John Mary Martinex</Text>
                <Text style={styles.candidateDetails}>
                  I'll let your voice be heard and work towards the fulfillment
                  of your needs.
                </Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button2}>
                <Text style={styles.buttonText2}>Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  choose: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 16,
  },
  collection: {
    alignItems: "center",
    gap: 20,
    marginBottom: 40,
  },
  candidate: {
    width: "100%",
    backgroundColor: "#FDD8CD",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FAB09B",
    elevation: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  top: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  candidateImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8612D",
  },
  image: {
    width: "96%",
    height: "96%",
    borderRadius: 45,
    elevation: 10,
  },
  right: {
    paddingHorizontal: 10,
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  candidateDetails: {
    fontSize: 14,
    color: "#868686",
    paddingVertical: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
    alignItems: "center",
  },
  button: {
    backgroundColor: "white",
    width: "46%",
    height: 45,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  button2: {
    backgroundColor: "#E8612D",
    width: "46%",
    height: 45,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e8612d",
  },
  buttonText2: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
