import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function Asterisk() {
  return (
    <View>
      <Text style={styles.asteriskText}>*</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  asteriskText: {
    color: "red",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
});
