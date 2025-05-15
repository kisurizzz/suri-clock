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
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const ReportsScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userNames, setUserNames] = useState({});

  const fetchUserData = async (userId) => {
    try {
      if (!userNames[userId]) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fullName = `${userData.firstName} ${userData.lastName}`;
          setUserNames((prev) => ({ ...prev, [userId]: fullName }));
          return fullName;
        }
      }
      return userNames[userId];
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

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

      console.log("Fetched sessions:", sessionsData.length);

      // Fetch user names for each session
      if (sessionsData.length > 0) {
        // Create a map of unique user IDs to avoid duplicate fetches
        const uniqueUserIds = [
          ...new Set(
            sessionsData.map((session) => session.userId).filter(Boolean)
          ),
        ];

        console.log("Unique user IDs:", uniqueUserIds.length);

        // Fetch names for all unique users
        for (const userId of uniqueUserIds) {
          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const fullName = `${userData.firstName} ${userData.lastName}`;
              console.log(`Fetched name for ${userId}: ${fullName}`);
              setUserNames((prev) => ({ ...prev, [userId]: fullName }));
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
      }

      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("Current user names:", Object.keys(userNames).length);
  }, [userNames]);

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

  const getUserName = (item) => {
    // Check if we have a name in our cache
    if (item.userId && userNames[item.userId]) {
      return userNames[item.userId];
    }

    // If no userId or no cached name, fall back to email with a warning
    if (!item.userId) {
      console.warn("Session missing userId:", item.id);
    } else if (!userNames[item.userId]) {
      console.warn(`No name found for user ${item.userId}`);
    }

    // Return email or a fallback
    return item.userEmail || "Unknown User";
  };

  const renderSession = ({ item }) => {
    const userName = getUserName(item);
    const hasName = item.userId && userNames[item.userId];

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.userInfo}>
            {hasName ? (
              <>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{item.userEmail}</Text>
              </>
            ) : (
              <Text style={styles.userName}>{item.userEmail}</Text>
            )}
          </View>
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
            <Text style={styles.timeValue}>
              {formatTime(item.clockOutTime)}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Duration</Text>
            <Text style={styles.timeValue}>
              {formatDuration(item.totalTime)}
            </Text>
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
  };

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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 8,
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
