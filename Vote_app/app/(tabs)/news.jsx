import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import image from "@/assets/images/download.jpg";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container}>
        <View style={styles.cont2}>
          <Text style={styles.heading}>Latest Updates & News</Text>
          <Text style={styles.subheading}>
            Stay informed with real-time updates and announcements regarding the
            app, and ongoing and upcoming Elections
          </Text>
        </View>

        <View style={styles.collection}>
          <View style={styles.list}>
            <View>
              <Ionicons
                name="volume-medium-outline"
                size={20}
                color="black"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.notes}>
              <Text style={styles.topic}>SYSTEM UPDATES</Text>
              <Text style={styles.details}>
                App v1.0001 released - Now includes Face ID login.
              </Text>
            </View>
          </View>
          <View style={styles.list}>
            <View>
              <Ionicons
                name="book-outline"
                size={20}
                color="black"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.notes}>
              <Text style={styles.topic}>VOTER EDUCATION</Text>
              <Text style={styles.details}>
                How to Verify Your Eligibility to Vote
              </Text>
            </View>
          </View>
          <View style={styles.list2}>
            <View style={styles.notes}>
              <Text style={styles.topic2}>
                Presidential Elections Now Set for May 20, 2025
              </Text>
              <Text style={styles.date}>April 17, 2025</Text>
              <Text style={styles.link}>View</Text>
            </View>
          </View>
          <View style={styles.list2}>
            <View style={styles.notes}>
              <Text style={styles.topic2}>
                Presidential Elections Now Set for May 20, 2025
              </Text>
              <Text style={styles.date}>April 17, 2025</Text>
              <Text style={styles.link}>View</Text>
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
    backgroundColor: "white",
    marginBottom: 100,
  },
  cont2: {
    backgroundColor: "#F78869",
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heading: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    width: "100%",
    paddingBottom: 10,
    color: "white",
  },
  subheading: {
    fontSize: 14,
    color: "white",
  },
  collection: {
    paddingBottom: 30,
  },
  list: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FEECE6",
    borderColor: "#FDD8CD",
    borderBottomWidth: 1,
  },
  list2: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFBF9",
    borderColor: "#FDD8CD",
    borderBottomWidth: 1,
  },
  topic: {
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
  },
  topic2: {
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "gray",
    paddingVertical: 10,
  },
  link: {
    fontWeight: "bold",
    color: "#F78869",
    fontSize: 18,
  },
});
