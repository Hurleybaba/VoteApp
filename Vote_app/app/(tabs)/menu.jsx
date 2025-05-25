import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import profileImage from "@/assets/images/download.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { baseUrl } from "../baseUrl";

const menu = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [academicData, setAcademicData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);

  const collectAcademicData = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/api/face/saa/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success || !response.data.userAcademicData) {
        console.log("No academic data found for user:", userId);
        return null;
      }

      // Check based on your backend response structure
      return response.data.userAcademicData;
    } catch (error) {
      console.error("Error checking academic data:", error);
      if (error.response?.status === 404) {
        console.log("Academic data not found for user");
        return null;
      }
      throw error;
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

    const isUserVerified = await AsyncStorage.getItem("isUserVerified");

    setKycVerified(isUserVerified === "true");
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

        const academicDataCollected = await collectAcademicData(
          response.data.user.userid
        );

        setAcademicData(academicDataCollected || {});
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setAcademicData({});
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

  const logUserOut = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.warn("No token found, already logged out or never logged in.");
        await AsyncStorage.removeItem("token"); // Just in case it's still partially there
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 15000,
        }
      );
      if (response.status === 200) {
        await AsyncStorage.removeItem("token");
        console.log("User successfully logged out from client-side.");
        router.replace("/index2");
      } else {
        throw new Error(response.data.message || "Error logging user out.");
      }
    } catch (error) {
      console.error(
        "Failed to log user out:",
        error.response ? error.response.data : error.message
      );
      await AsyncStorage.removeItem("token");
      router.replace("/index2");
      Alert.alert(
        "Logout Failed",
        error.response?.data?.message || "Could not log out. Please try again."
      );
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

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E8612D"]}
            tintColor="#E8612D"
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      >
        <View style={styles.container}>
          <View style={styles.circle}>
            <Image source={profileImage} style={styles.profile} />
          </View>
          <View style={styles.update}>
            <Text style={styles.updateText}>{`${capitalize(
              user.first_name
            )} ${capitalize(user.last_name)}`}</Text>
            {!kycVerified ? (
              <Ionicons
                name="help-circle-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="green"
                // backgroundColor="green"
                style={styles.backIcon}
              />
            )}
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>ACCOUNT INFORMATIONS</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Role</Text>

              <Text style={styles.right}>User</Text>
            </View>
            <View style={styles.setting}>
              <Text>Verified</Text>

              {kycVerified ? (
                <Text style={styles.right}>Yes</Text>
              ) : (
                <Text style={styles.right}>No</Text>
              )}
            </View>
            <View style={styles.setting}>
              <Text>Member Since</Text>

              <Text style={styles.right}>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Verified Since</Text>

              <Text style={styles.right}>
                {academicData.verified_at
                  ? new Date(academicData.verified_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>PERSONAL DETAILS</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Name</Text>
              <Text
                style={styles.right2}
              >{`${user.last_name} ${user.first_name} ${user.middle_name}`}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Username</Text>
              <Text style={styles.right}>{user.username}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Age</Text>
              <Text style={styles.right}>{user.age}</Text>
            </View>

            <View style={styles.setting}>
              <Text>Email</Text>
              <Text style={styles.right2}>{user.email}</Text>
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Phone Number</Text>
              <Text style={styles.right}>{user.phone}</Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>ACADEMIC DETAILS</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Faculty</Text>
              <Text style={styles.right2}>{academicData.faculty_name}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Department</Text>
              <Text style={styles.right2}>{academicData.department}</Text>
            </View>
            <View style={styles.setting}>
              <Text>Matric No</Text>
              <Text style={styles.right}>{academicData.matric_no}</Text>
            </View>

            <View style={[styles.setting, styles.setting2]}>
              <Text>Level</Text>
              <Text style={styles.right2}>{academicData.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.parent}>
          <Text style={styles.subtopic}>GENERAL</Text>
          <View style={styles.settingContainer}>
            <View style={styles.setting}>
              <Text>Themes</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Credits</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Contact</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={styles.setting}>
              <Text>Licence & Agreement</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
            <View style={[styles.setting, styles.setting2]}>
              <Text>Change Password</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="grey"
                style={styles.backIcon}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.parent} onPress={() => logUserOut()}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default menu;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#F5FCFF",
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
    alignItems: "flex-end",
    justifyContent: "center",
  },
  updateText: {
    fontSize: 20,
  },
  backIcon: {},
  parent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subtopic: {
    color: "grey",
    fontSize: 14,
    marginBottom: 6,
  },
  settingContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    borderColor: "#b4b4b4",
    backgroundColor: "#dcdcdc",
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#b4b4b4",
  },
  setting2: {
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  text: {
    fontSize: 18,
  },
  lefty: {
    fontWeight: 600,
    fontsize: 18,
  },
  right: {
    textTransform: "uppercase",
    fontWeight: 600,
    color: "gray",
  },
  right2: {
    textTransform: "capitalize",
    fontWeight: 600,
    color: "gray",
    fontSize: 14,
    textAlign: "right",
  },
  logout: {
    color: "red",
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#e4e4e4",
    borderColor: "#dcdcdc",
  },
});
