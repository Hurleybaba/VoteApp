import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import image from "@/assets/images/success.png";
import Button from "@/components/button";

export default function electionId() {
  const router = useRouter();
  const { electionId, candidateId } = useLocalSearchParams();
  

  const [user, setUser] = useState({});
  const [candidate, setCandidate] = useState({});
  const [error, setError] = useState(null);

  const getCandidate = async () => {
    try {
      setIsLoading(true);
      const candidateData = await AsyncStorage.getItem("candidateData");

      if (!candidateData) {
        Alert.alert("Error", "Candidate data not found");
        setError("Candidate not found");
        return;
      }

      const parsedData = JSON.parse(candidateData);
      if (!parsedData?.first_name) {
        throw new Error("Invalid candidate data format");
      }

      setCandidate(parsedData);
    } catch (error) {
      console.error("Failed to load candidate:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load candidate data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.cont}>
          <Text style={styles.huge}>Thank You!</Text>
          <Text style={styles.huge}>Your vote was submitted successfully.</Text>
          <Image source={image} style={styles.image} />
        </View>

        <View style={styles.innerContainer}>
          <Text style={styles.small}>
            The receipt is sent to your email address
          </Text>
          <Button
            text="VIEW RECIEPT"
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
              router.replace({
                pathname: `/${electionId}/receipt/`,
                params: {
                  electionId: electionId,
                  candidateId: candidate.candidate_id,
                },
              });
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
  cont: {
    marginTop: 30,
    width: "80%",
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 240,
    height: 240,
    marginVertical: 30,
  },
  huge: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E8612D",
    textAlign: "center",
  },
  small: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
});
