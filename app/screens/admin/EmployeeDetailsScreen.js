import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const EmployeeDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch employee data
        const employeeDoc = await getDoc(doc(db, "users", userId));
        if (employeeDoc.exists()) {
          setEmployee({ id: employeeDoc.id, ...employeeDoc.data() });
        }

        // Fetch recent sessions
        const sessionsQuery = query(
          collection(db, "completedSessions"),
          where("userId", "==", userId),
          orderBy("clockInTime", "desc"),
          limit(5)
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [userId]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Employee Not Found</Text>
          <Text style={styles.message}>
            Could not find employee with ID: {userId || "Unknown"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Employee Profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {employee.firstName} {employee.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{employee.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{employee.role}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Joined:</Text>
            <Text style={styles.value}>
              {employee.createdAt
                ? new Date(employee.createdAt.toDate()).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Clock Sessions</Text>
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>
                    {new Date(
                      session.clockInTime.toDate()
                    ).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.totalTime)}
                  </Text>
                </View>
                <View style={styles.sessionTimes}>
                  <Text style={styles.timeText}>
                    In: {formatTime(session.clockInTime)}
                  </Text>
                  <Text style={styles.timeText}>
                    Out: {formatTime(session.clockOutTime)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent sessions found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#7f8c8d",
    width: 80,
  },
  value: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  sessionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  sessionDuration: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "bold",
  },
  sessionTimes: {
    flexDirection: "column",
  },
  timeText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  emptyText: {
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 24,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default EmployeeDetailsScreen;
