import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { icons } from "@/constants/icon";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps {
  focused: boolean;
  icon: any; // or use proper image source type
  name: string;
}

const TabIcon = ({ focused, icon, name }: TabIconProps) => {
  if (focused) {
    return (
      <View style={styles.container}>
        <Image
          source={icon}
          style={{
            width: 16,
            height: 16,
            tintColor: "#fff",
          }}
        />
        <Text style={styles.text}>{name}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container2}>
      <Image
        source={icon}
        style={{
          width: 16,
          height: 16,
          tintColor: "#fff",
        }}
      />
    </View>
  );
};
const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0d23",
          borderRadius: 50,
          marginBottom: insets.bottom,
          marginHorizontal: 10,
          height: 50,
          overflow: "hidden",
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} name="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.news} name="News" />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.menu} name="Menu" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    minWidth: 120,
    minHeight: 52,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8612D",
    backgroundColor: "#E8612D",
    borderRadius: 50,
    paddingHorizontal: 10,
  },
  container2: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 112,
    minHeight: 50,
    marginTop: 20,
  },
  text: {
    color: "#fff",
  },
});
