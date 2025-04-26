import { Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

const Button = ({ text, handlePress, buttonStyle, textStyle, disabled }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, buttonStyle]}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 40,
    padding: 14,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: "#E8612D",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
    color: "white",
  },
});
