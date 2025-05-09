import { Link } from "expo-router";
import { useEffect, useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import image from "@/assets/images/download.jpg";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../baseUrl";

import axios from "axios";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLoginStatusAndFetchUser = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/index2");
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setUser(response.data); // Set response.data instead of whole response
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setError(error.message);

      // Clear invalid token and redirect
      await AsyncStorage.removeItem("token");
      router.replace("/index2");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkLoginStatusAndFetchUser();
  };

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

  console.log(user);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8612D" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchUserData}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E8612D"]}
            tintColor="#E8612D"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.box1}>
          <View style={styles.circle}>
            <Image source={image} style={styles.image} />
          </View>
          <View>
            <Text style={styles.welcomeText}>
              Welcome,{" "}
              {user ? (
                <Text style={styles.user}>{user.username}</Text>
              ) : (
                <Text> Loading...</Text>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryText: {
    color: "#E8612D",
    fontWeight: "bold",
  },
});
