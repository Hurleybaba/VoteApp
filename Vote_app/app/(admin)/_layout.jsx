import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="election" screenOptions={{ headerShown: false }} />
    </Stack>
  );
}
