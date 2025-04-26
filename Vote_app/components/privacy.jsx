import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Privacy() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Priacy Policy</Text>
      <Text style={styles.text}>Terms of Service</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "70%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#868686",
  },
});
