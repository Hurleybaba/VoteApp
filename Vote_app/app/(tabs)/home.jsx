import { Link } from "expo-router";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import image from "@/assets/images/download.jpg";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container}>
        <View style={styles.box1}>
          <View style={styles.circle}>
            <Image source={image} style={styles.image} />
          </View>
          <View>
            <Text style={styles.welcomeText}>
              Welcome,
              <Text style={styles.user}> User</Text>
            </Text>
          </View>
        </View>
        <View style={styles.box2}>
          <Text style={styles.completeKYC}>Complete your KYC</Text>
        </View>
        <Text style={styles.heading}>Ongoing Elections</Text>
        <View style={styles.collection}>
          <View style={styles.feed}>
            <View style={styles.newsfeedDetails}>
              <Text style={styles.topic}>Vote for Student Representative</Text>
              <Text style={styles.duration}>April 8th - 10th 8am to 10pm</Text>
            </View>
          </View>
          <View style={styles.feed}>
            <View style={styles.newsfeedDetails}>
              <Text style={styles.topic}>Vote for Student Representative</Text>
              <Text style={styles.duration}>April 8th - 10th 8am to 10pm</Text>
            </View>
          </View>
          <View style={styles.feed}>
            <View style={styles.newsfeedDetails}>
              <Text style={styles.topic}>Vote for Student Representative</Text>
              <Text style={styles.duration}>April 8th - 10th 8am to 10pm</Text>
            </View>
          </View>
          <View style={styles.feed}>
            <View style={styles.newsfeedDetails}>
              <Text style={styles.topic}>Vote for Student Representative</Text>
              <Text style={styles.duration}>April 8th - 10th 8am to 10pm</Text>
            </View>
          </View>
        </View>
        <View style={styles.more}>
          <Link href="/news">
            <TouchableOpacity style={{ flexDirection: "row", gap: 5 }}>
              <Text style={styles.moreText}>See more</Text>
              <Ionicons
                name="caret-forward-outline"
                size={24}
                color="#E8612D"
              />
            </TouchableOpacity>
          </Link>
        </View>
        <Text style={styles.heading}>Upcoming Elections</Text>
        <View style={styles.collection}>
          <View style={styles.feed}>
            <View style={styles.newsfeedDetails}>
              <Text style={styles.topic}>Vote for Student Representative</Text>
              <Text style={styles.duration}>April 8th - 10th 8am to 10pm</Text>
            </View>
          </View>
        </View>
        <View style={styles.more}>
          <Link href="/news">
            <TouchableOpacity style={{ flexDirection: "row", gap: 5 }}>
              <Text style={styles.moreText}>See more</Text>
              <Ionicons
                name="caret-forward-outline"
                size={24}
                color="#E8612D"
              />
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "white",
    marginBottom: 100,
  },
  box1: {
    width: "100%",
    height: 70,
    // borderWidth: 1,
    // borderColor: "black",
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    paddingTop: 10,
    alignItems: "center",
    // justifyContent: "center",
    gap: 10,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  user: {
    color: "#E8612D",
  },
  box2: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8612D",
  },
  completeKYC: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  heading: {
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#E8612D",
    borderBottomColor: "#E8612D",
    borderBottomWidth: 3,
    paddingBottom: 3,
    width: "fit-content",
    maxWidth: 220,
    alignSelf: "center",
    marginBottom: 12,
    marginTop: 26,
  },
  collection: {
    width: "100%",
    overflow: "hidden",
    height: "auto",
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    paddingVertical: 10,
  },
  feed: {
    width: 150,
    height: 150,
    backgroundColor: "#F6C6B3",
    borderRadius: 10,

    padding: 6,
    alignContent: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    borderWidth: 1,
    borderColor: "#E8612D",
  },
  topic: {
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
  },
  duration: {
    fontSize: 14,
    fontWeight: 600,
    color: "#4f4f4f",
    marginTop: 10,
    textAlign: "center",
  },
  subtopic: {
    fontSize: 14,
    fontWeight: 500,
    textAlign: "center",
  },
  more: {
    alignSelf: "flex-end",
  },
  moreText: {
    fontSize: 16,
  },
});
