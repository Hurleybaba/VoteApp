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
  Alert,
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
  const [user, setUser] = useState({});
  const [hasAcademicData, setHasAcademicData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const checkFaceData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/api/face/saa/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check based on your backend response structure
      if (response.data.success && response.data.userAcademicData) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking academic data:", error);
      return false;
    }
  };

  const checkLoginStatusAndFetchUser = async () => {
    setIsLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/index2");
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Conrol": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        if (!response.data?.user) {
          throw new Error("Invalid user data structure");
        }
        setUser(response.data.user);

        const isVerified = Boolean(response.data.verified);
        setKycVerified(isVerified);
        await AsyncStorage.setItem("isUserVerified", isVerified.toString());

        if (!isVerified) {
          const academicDataExists = await checkFaceData(
            response.data.user.userid
          );

          setHasAcademicData(academicDataExists);
        }
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setError(error.message);

      // Clear invalid token and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.multiRemove(["token", "isUserVerified"]);
        router.replace("/index2");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkLoginStatusAndFetchUser();
  };

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

  // console.log(user);
  console.log("User ID:", user?.userid);

  if (isLoading || Object.keys(user).length === 0) {
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
        <TouchableOpacity
          onPress={checkLoginStatusAndFetchUser}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleKYCRedirect = () => {
    if (!user?.userid) {
      Alert.alert("Error", "User data not loaded yet");
      return;
    }

    router.push({
      pathname: `/[kyc]/kycpg${hasAcademicData ? "2" : "1"}`,
      params: {
        kyc: "kyc",
        userid: user.userid,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        <View style={styles.box1}>
          <View style={styles.circle}>
            <Image source={image} style={styles.image} />
          </View>
          <View>
            <Text style={styles.welcomeText}>
              Welcome,{" "}
              {user ? (
                <Text style={styles.user}>{capitalize(user.username)}</Text>
              ) : (
                <Text> Loading...</Text>
              )}
            </Text>
          </View>
        </View>
        {!kycVerified && (
          <TouchableOpacity onPress={handleKYCRedirect}>
            <View style={styles.box2}>
              <Text style={styles.completeKYC}>
                {hasAcademicData ? "Continue KYC" : "Complete your KYC"}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.heading}>Ongoing Elections</Text>
        {!kycVerified ? (
          <View style={styles.noKycContainer}>
            <Text style={styles.noKycText}>
              Complete KYC to view ongoing Elections
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.collection}>
              <TouchableOpacity
                style={styles.feed}
                onPress={() => router.push("/(election)/123")}
              >
                <View style={styles.newsfeedDetails}>
                  <Text style={styles.topic}>
                    Vote for Student Representative
                  </Text>
                  <Text style={styles.duration}>
                    April 8th - 10th 8am to 10pm
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.feed}>
                <View style={styles.newsfeedDetails}>
                  <Text style={styles.topic}>
                    Vote for Student Representative
                  </Text>
                  <Text style={styles.duration}>
                    April 8th - 10th 8am to 10pm
                  </Text>
                </View>
              </View>
              <View style={styles.feed}>
                <View style={styles.newsfeedDetails}>
                  <Text style={styles.topic}>
                    Vote for Student Representative
                  </Text>
                  <Text style={styles.duration}>
                    April 8th - 10th 8am to 10pm
                  </Text>
                </View>
              </View>
              <View style={styles.feed}>
                <View style={styles.newsfeedDetails}>
                  <Text style={styles.topic}>
                    Vote for Student Representative
                  </Text>
                  <Text style={styles.duration}>
                    April 8th - 10th 8am to 10pm
                  </Text>
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
          </>
        )}

        <Text style={styles.heading}>Upcoming Elections</Text>
        {!kycVerified ? (
          <View style={styles.noKycContainer}>
            <Text style={styles.noKycText}>
              Complete KYC to view ongoing Elections
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.collection}>
              <View style={styles.feed}>
                <View style={styles.newsfeedDetails}>
                  <Text style={styles.topic}>
                    Vote for Student Representative
                  </Text>
                  <Text style={styles.duration}>
                    April 8th - 10th 8am to 10pm
                  </Text>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "white",
    // paddingBottom: 50,
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
  noKycContainer: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    marginTop: 20,
    borderColor: "transparent",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAB09B",
  },
  noKycText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
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
