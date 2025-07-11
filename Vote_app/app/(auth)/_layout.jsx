import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="index2" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="login" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="signup" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="signup2" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="signup3" screenOptions={{ headerShown: false }} />
      <Stack.Screen name="otp-screen" screenOptions={{ headerShown: false }} />
      <Stack.Screen
        name="forgot-password"
        screenOptions={{ headerShown: false }}
      />
      <Stack.Screen
        name="reset-password"
        screenOptions={{ headerShown: false }}
      />
    </Stack>
  );
}
