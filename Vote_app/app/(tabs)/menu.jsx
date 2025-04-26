import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import profileImage from "@/assets/images/download.jpg";

const menu = () => {
  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={{ flex: 1, marginBottom: 80 }}>
        <View style={styles.container}>
          <View style={styles.circle}>
            <Image source={profileImage} style={styles.profile} />
          </View>
          <View style={styles.update}>
            <Text style={styles.updateText}>Update Profile</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>

        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.left}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.text}>Settings 1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="black"
              style={styles.backIcon}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default menu;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    width: "100%",
    height: 260,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "red",
    marginBottom: 10,
    overflow: "hidden",
  },
  profile: {
    width: "100%",
    height: "100%",
  },
  update: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  updateText: {
    fontSize: 18,
  },
  backIcon: {},
  settingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  text: {
    fontSize: 18,
  },
});
