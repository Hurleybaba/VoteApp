import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";
import Asterisk from "./asterisk";

export default function Input({
  name,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  error,
  showErrors,
  secureTextEntry,
}) {
  return (
    <View style={styles.outerContainer}>
      <View>
        <Text style={styles.text}>
          {name}
          <Asterisk />
        </Text>
      </View>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        style={[styles.input, showErrors && error && styles.inputError]}
        placeholderTextColor="#868686"
      />
      {showErrors && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "regular",
    color: "gray",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#DADADA",
    backgroundColor: "white",
    // borderRadius: 4,
    fontSize: 16,
    paddingVertical: 8,
    // marginTop: 5,
  },
  inputError: {
    borderColor: "red", // Red border for error state
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
