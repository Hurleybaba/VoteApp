import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import image from "@/assets/images/success.png";
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
            text="BACK TO HOME SCREEN"
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
              router.replace("/(tabs)/home");
            }}
          />
          <Button
            text="SEE RECEIPT"
            buttonStyle={{
              backgroundColor: "white",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#E8612D",
            }}
            handlePress={() => {
              router.replace("/electionId/receipt");
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
