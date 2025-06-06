import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";
import { PaperProvider, adaptNavigationTheme } from "react-native-paper";
import { DefaultTheme as PaperDefaultTheme } from "react-native-paper";

import { useEffect } from "react";
import {
  registerForPushNotificationsAsync,
  saveExpoToken,
  setupNotifications,
} from "../utils/notificationHelper";

const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: "#E8612D", // Your primary color
    accent: "#FDD8CD", // Your secondary color
  },
};

export default function RootLayout() {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await setupNotifications();
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await saveExpoToken(token);
          console.log(
            "Successfully registered for notifications with token:",
            token.data
          );
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(election)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="[kyc]" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
