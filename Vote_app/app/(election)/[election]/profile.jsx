import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";

import image from "@/assets/images/download.jpg";
import Button from "@/components/button";

export default function electionId() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.up}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#e8612d" />
          </TouchableOpacity>
          <Text style={styles.heading}>Vote for Student Representative</Text>
        </View>
        <View style={styles.parent}>
          <View style={styles.bigCircle}></View>
          <View style={styles.smallCircle}>
            <Image source={image} style={styles.image} />
          </View>
        </View>
        <View>
          <Text style={styles.name}>John Doe Ronaldo</Text>
          <Text style={styles.bioTopic}>SHORT BIOGRAPHY</Text>
          <Text style={styles.bio}>
            My name is John Doe, but you can just call me John. I am 26 years
            old and i'm currently living in Ibadan, Nigeria. This is my third
            year studying Computer Science in LCU. Also, iam working as a
            part-time teaching assistant
          </Text>
          <Text style={styles.manifestoTopic}>ELECTION MANIFESTO</Text>
          <Text style={styles.manifesto}>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
            commodo ligula eget dolor. Aenean massa. Cum sociis natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            Nulla consequat massa quis enim. Donec pede justo, fringilla vel,
            aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
            imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede
            mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum
            semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula,
            porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem
            ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra
            nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet.
            Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies
            nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget
            condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem
            neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar,
            hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.
            Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.
            Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed
            fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed
            consequat, leo eget bibendum sodales, augue velit cursus nunc,
          </Text>
        </View>
      </ScrollView>
      <View style={styles.button}></View>
      <Button
        text="VOTE"
        buttonStyle={{
          position: "absolute",
          bottom: 20,
          marginLeft: 20,
          width: "90%",
        }}
        textStyle={{
          fontSize: 18,
          fontWeight: "bold",
        }}
        handlePress={() => {
          router.push("/signup2");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    padding: 10,
  },
  up: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8612D",
  },
  parent: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bigCircle: {
    width: 500,
    height: 500,
    borderRadius: 250,
    position: "absolute",
    backgroundColor: "#FDD8CD",
    left: "-25%",
    top: -300,
    zIndex: -1,
    borderWidth: 3,
    borderColor: "#fab09b",
  },
  smallCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 80,
    borderWidth: 3,
    borderColor: "#fab09b",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },
  bioTopic: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
  },
  bio: {
    fontSize: 16,
    fontWeight: "regular",
    marginBottom: 20,
  },
  manifestoTopic: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 16,
  },
  manifesto: {
    fontSize: 16,
    fontWeight: "regular",
    marginBottom: 120,
  },
  button: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    paddingVertical: 10,
    opacity: 0.85,
    backgroundColor: "white",
    height: 100,
    elevation: 20,
  },
});
