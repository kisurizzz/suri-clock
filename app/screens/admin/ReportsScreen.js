import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

const ReportsScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionsQuery = query(
        collection(db, "completedSessions"),
        orderBy("clockInTime", "desc")
      );

      const querySnapshot = await getDocs(sessionsQuery);
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.toDate()).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.userEmail}>{item.userEmail}</Text>
        <Text style={styles.date}>
          {new Date(item.clockInTime.toDate()).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Clock In</Text>
          <Text style={styles.timeValue}>{formatTime(item.clockInTime)}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Clock Out</Text>
          <Text style={styles.timeValue}>{formatTime(item.clockOutTime)}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Duration</Text>
          <Text style={styles.timeValue}>{formatDuration(item.totalTime)}</Text>
        </View>
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.locationLabel}>Clock In Location:</Text>
        <Text style={styles.locationValue}>
          Lat: {item.clockInLocation.latitude.toFixed(6)}, Lon:{" "}
          {item.clockInLocation.longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Clock Sessions</Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sessions found</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  sessionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: "#2c3e50",
  },
  locationInfo: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 12,
    color: "#34495e",
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    fontSize: 16,
    marginTop: 20,
  },
});

export default ReportsScreen;
