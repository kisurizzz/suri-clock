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

    // If we have a userId but no cached name, trigger a fetch
    if (item.userId && !userNames[item.userId]) {
      // Call fetchUserData but don't await it to avoid blocking render
      fetchUserData(item.userId);
      return "Loading..."; // Show loading state while fetching
    }

    // If no userId, fall back to email with a warning
    if (!item.userId) {
      console.warn("Session missing userId:", item.id);
      return item.userEmail || "Unknown User";
    }

    // Return email as fallback
    return item.userEmail || "Unknown User";
  };

  const renderSessionItem = ({ item }) => {
    // Format date
    const date = item.clockInTime?.toDate
      ? new Date(item.clockInTime.toDate())
      : new Date();
    const formattedDate = date.toLocaleDateString();

    // Format clock in time
    const clockInTime = item.clockInTime?.toDate
      ? new Date(item.clockInTime.toDate()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    // Format clock out time
    const clockOutTime = item.clockOutTime?.toDate
      ? new Date(item.clockOutTime.toDate()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    // Calculate duration
    const durationHours = item.totalTime
      ? Math.floor(item.totalTime / 3600)
      : 0;
    const durationMinutes = item.totalTime
      ? Math.floor((item.totalTime % 3600) / 60)
      : 0;
    const formattedDuration = `${durationHours}h ${durationMinutes}m`;

    // Format the vehicle information
    const vehicle = item.vehicle
      ? `${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.registrationNumber})`
      : "Not specified";

    return (
      <View style={styles.sessionItem}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>{formattedDate}</Text>
          <Text style={styles.sessionDuration}>{formattedDuration}</Text>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Employee:</Text>
            <Text style={styles.detailValue}>{getUserName(item)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Clock In:</Text>
            <Text style={styles.detailValue}>{clockInTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Clock Out:</Text>
            <Text style={styles.detailValue}>{clockOutTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle:</Text>
            <Text style={styles.detailValue}>{vehicle}</Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
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
        renderItem={renderSessionItem}
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
  sessionItem: {
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
  sessionDate: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  sessionDuration: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  detailValue: {
    fontSize: 14,
    color: "#2c3e50",
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  notesText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    fontSize: 16,
    marginTop: 20,
  },
});

export default ReportsScreen;
