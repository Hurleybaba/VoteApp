import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import Asterisk from "./asterisk";

export default function CustomPicker({
  name,
  option1,
  option2,
  option3,
  option4,
  selectedOption,
  onValueChange,
  error,
  showErrors,
}) {
  const items = [
    { label: option1, value: option1 },
    { label: option2, value: option2 },
    { label: option3, value: option3 },
    { label: option4, value: option4 },
  ];

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.text}>
        {name}
        <Asterisk />
      </Text>
      <View
        style={[
          styles.inputContainer,
          showErrors && error && styles.pickerError,
        ]}
      >
        <RNPickerSelect
          onValueChange={onValueChange}
          items={items}
          value={selectedOption}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      {showErrors && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "black",
  },
});

const styles = StyleSheet.create({
  inputContainer: {
    borderBottomWidth: 1,
    borderColor: "#DADADA",
    justifyContent: "center",
    height: 50,
  },
  outerContainer: {
    marginVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "regular",
    color: "gray",
    marginBottom: 8,
  },
  pickerContainer: {
    borderBottomWidth: 1,
    borderColor: "#DADADA",
    backgroundColor: "white",
  },
  picker: {
    height: 50, // Standard height for better touch area
  },
  pickerError: {
    borderColor: "red", // Red border for error state
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
