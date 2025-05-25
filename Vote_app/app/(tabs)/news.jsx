import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../baseUrl";

export default function News() {
  const router = useRouter();

  const [user, setUser] = useState({});
  const [posts, setPosts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const checkLoginStatusAndFetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/index2");
        return;
      }

      const isUserVerified = await AsyncStorage.getItem("isUserVerified");

      setKycVerified(isUserVerified === "true");
      const response = await axios.get(`${baseUrl}/api/election`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Conrol": "no-cache",
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setPosts(response.data.posts);
      } else {
        throw new Error("Failed to fetch user/news data");
      }
    } catch (error) {
      console.error("Failed error:", error);
      setError(error.message);

      // Clear invalid token and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        await AsyncStorage.removeItem("token");
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

  useEffect(() => {
    checkLoginStatusAndFetchUser();
  }, []);

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

  console.log("User ID:", user?.userid);

  // const renderElectionItem = ({ item }) => {
  //   return (
  //     <TouchableOpacity style={styles.list2}>
  //       <View style={styles.notes}>
  //         <View style={styles.neww}>
  //           <Text style={styles.topic2}>{item.election_name}</Text>
  //           <Text style={styles.date}>
  //             {item.created_at
  //               ? new Date(
  //                   item.created_at.replace(" ", "T")
  //                 ).toLocaleDateString()
  //               : ""}
  //           </Text>
  //         </View>
  //         <View>
  //           <Ionicons
  //             name="chevron-forward-outline"
  //             size={20}
  //             color="black"
  //             style={styles.backIcon}
  //           />
  //         </View>
  //       </View>
  //     </TouchableOpacity>
  //   );
  // };
  const renderElectionItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => this.handleElectionPress(item)}
      style={styles.list2}
    >
      <View
        style={[
          styles.notes,
          {
            borderLeftWidth: 5,
            paddingLeft: 5,
            borderLeftColor:
              item.status === "ended"
                ? "red"
                : item.status === "ongoing"
                ? "green"
                : "blue",
          },
        ]}
      >
        <View style={styles.neww}>
          <Text style={styles.topic2}>{item.election_name}</Text>
          <Text style={styles.date}>
            {item.created_at
              ? new Date(item.created_at.replace(" ", "T")).toLocaleDateString()
              : ""}
          </Text>
          <Text
            style={[
              styles.electionStatus,
              {
                color:
                  item.status === "ended"
                    ? "red"
                    : item.status === "ongoing"
                    ? "green"
                    : "blue",
              },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>

        <View>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color="black"
            style={styles.backIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View style={styles.cont2}>
          <Text style={styles.heading}>Latest Updates & News</Text>
          <Text style={styles.subheading}>
            Stay informed with real-time updates and announcements regarding the
            app, and ongoing and upcoming Elections
          </Text>
        </View>

        {!kycVerified ? (
          <View style={styles.kycPrompt}>
            <Ionicons name="alert-circle" size={24} color="#E8612D" />
            <Text style={styles.kycText}>
              Please complete KYC verification to view news
            </Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => router.push("/kyc-verification")}
            >
              <Text style={styles.verifyButtonText}>Verify Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
              <View style={styles.notes1}>
                <Text style={styles.topic}>SYSTEM UPDATES</Text>
                <Text style={styles.details}>
                  App v1.0001 released - Now includes Face ID login efiubeef .
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
              <View style={styles.notes1}>
                <Text style={styles.topic}>VOTER EDUCATION</Text>
                <Text style={styles.details}>
                  How to Verify Your Eligibility to Vote
                </Text>
              </View>
            </View>
            <FlatList
              data={posts}
              renderItem={renderElectionItem}
              keyExtractor={(item) => item.election_id?.toString()}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", padding: 20 }}>
                  No elections found
                </Text>
              }
              scrollEnabled={false}
              // refreshing={false}
              // onRefresh={() => refetchData()}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  cont2: {
    backgroundColor: "#F78869",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: "white",
  },
  kycPrompt: {
    alignItems: "center",
    padding: 20,
    margin: 20,
    backgroundColor: "#FEECE6",
    borderRadius: 10,
  },
  kycText: {
    marginVertical: 10,
    textAlign: "center",
    color: "#E8612D",
  },
  verifyButton: {
    backgroundColor: "#E8612D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  verifyButtonText: {
    color: "white",
    fontWeight: "bold",
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
  // electionItem: {
  //   padding: 15,
  //   marginVertical: 5,
  //   backgroundColor: "white",
  //   borderRadius: 5,
  //   // other styles...
  // },
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
    paddingRight: 16,
  },
  notes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notes1: {
    flexDirection: "column",
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
