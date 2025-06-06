import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BarChart, Grid } from "react-native-svg-charts";
import { Text as SvgText } from "react-native-svg";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../baseUrl";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/button";

import image from "@/assets/images/download.jpg";

//ended
const Labels = ({ x, y, bandwidth, data }) => (
  <>
    {data.map((item, index) => (
      <React.Fragment key={index}>
        <SvgText
          x={x(index) + bandwidth / 2}
          y={y(item.value) - 10}
          fontSize={14}
          fontWeight="600"
          fill="#1F2937"
          alignmentBaseline="middle"
          textAnchor="middle"
        >
          {item.value}
        </SvgText>
        <SvgText
          x={x(index) + bandwidth / 2}
          y={290}
          fontSize={14}
          fontWeight="600"
          fill="#4B5563"
          alignmentBaseline="middle"
          textAnchor="middle"
        >
          {item.label}
        </SvgText>
      </React.Fragment>
    ))}
  </>
);

const colorss = [
  "#E8612D",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
];

const ResultCard = ({ candidate, color }) => (
  <View style={styles.resultCard}>
    <View style={styles.candidateInfo}>
      <View style={[styles.candidateImg, { backgroundColor: color }]}>
        <Image style={styles.image} source={image} />
      </View>
      <Text
        style={styles.candidateName}
      >{`${candidate.first_name} ${candidate.last_name}`}</Text>
    </View>
    <View style={styles.voteCount}>
      <Text style={[styles.voteText, { color }]}>{candidate.votes}</Text>
      <Text style={styles.voteLabel}>Votes</Text>
    </View>
  </View>
);

const LegendItem = ({ color, name }) => (
  <View style={styles.legendItem}>
    <View style={[styles.colorDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{name}</Text>
  </View>
);

export default function electionPage() {
  const router = useRouter();
  const { electionId } = useLocalSearchParams();

  // const []
}
