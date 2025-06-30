import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";

const http = axios.create({
  baseURL: "http://192.168.43.157:3000",
  timeout: 50000,
});

http.interceptors.request.use(async function (config) {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  config.headers["Authorization"] = `Bearer ${token}`;

  return config;
});

http.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    console.log("error:   ", error);
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        // Token is invalid or unauthorized
        AsyncStorage.removeItem("token"); // Clear the invalid token
        return Alert.alert(
          "Session Expired",
          "Your session has expired or is invalid. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"), // Redirect to your login screen
            },
          ]
        );
      } else if (error.response.status === 400) {
        // Pass through 400 errors to be handled by the component
        return Promise.reject(error);
      }
    } else if (error.code === "ECONNABORTED") {
      // Axios timeout error
      return Alert.alert(
        "Error",
        "Request timed out. Please check your network or try again."
      );
    }
    return Promise.reject(error);
  }
);

export default http;
