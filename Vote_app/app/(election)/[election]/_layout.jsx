import { Stack } from "expo-router";

export default function ElectionFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" screenOptions={{ headerShown: false }} />
      {/* <Stack.Screen name="profile" screenOptions={{ headerShown: false }} /> */}
    </Stack>
  );
}
