import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../../contexts/AuthContext";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

const ClockInOutScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [clockTime, setClockTime] = useState(new Date());
  const [error, setError] = useState(null);

  // Check clock status
  useEffect(() => {
    if (currentUser) {
      checkClockStatus();
    }
  }, [currentUser]);

  // Location permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status !== "granted") {
        setError("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  // Time updater
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkClockStatus = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, "clockSessions", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.currentSession && !userData.currentSession.clockOutTime) {
          setIsClockedIn(true);
          setCurrentSession(userData.currentSession);
        } else {
          setIsClockedIn(false);
          setCurrentSession(null);
        }
      } else {
        setIsClockedIn(false);
        setCurrentSession(null);
      }
    } catch (err) {
      console.error("Error checking clock status:", err);
      Alert.alert("Error", "Failed to check clock status");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        "Permission Required",
        "Location permission is required to clock in/out"
      );
      return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLastLocation(location);
      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Failed to get your current location");
      return null;
    }
  };

  const handleClockInOut = async () => {
    try {
      setLoading(true);

      const location = await getCurrentLocation();
      if (!location) {
        setLoading(false);
        return;
      }

      const timestamp = Timestamp.now();
      const userDocRef = doc(db, "clockSessions", currentUser.uid);

      if (!isClockedIn) {
        // Clock in
        const newSession = {
          clockInTime: timestamp,
          clockInLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          },
          userId: currentUser.uid,
          userEmail: currentUser.email,
          notes: "",
        };

        await setDoc(
          userDocRef,
          {
            currentSession: newSession,
            lastUpdated: timestamp,
            userId: currentUser.uid,
            userEmail: currentUser.email,
          },
          { merge: true }
        );

        setIsClockedIn(true);
        setCurrentSession(newSession);
        Alert.alert("Success", "You have clocked in successfully");
      } else {
        // Clock out
        if (currentSession) {
          const sessionId = `${
            new Date(currentSession.clockInTime.toDate())
              .toISOString()
              .split("T")[0]
          }_${currentUser.uid}`;
          const sessionDocRef = doc(db, "completedSessions", sessionId);

          const updatedSession = {
            ...currentSession,
            clockOutTime: timestamp,
            clockOutLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
            },
            totalTime: timestamp.seconds - currentSession.clockInTime.seconds,
          };

          // Save completed session
          await setDoc(sessionDocRef, updatedSession);

          // Update user's current session
          await setDoc(
            userDocRef,
            {
              currentSession: null,
              lastSession: updatedSession,
              lastUpdated: timestamp,
            },
            { merge: true }
          );

          setIsClockedIn(false);
          setCurrentSession(null);
          Alert.alert("Success", "You have clocked out successfully");
        }
      }
    } catch (error) {
      console.error("Error clocking in/out:", error);
      Alert.alert(
        "Error",
        `Failed to ${isClockedIn ? "clock out" : "clock in"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Current Time</Text>
          <Text style={styles.timeDisplay}>
            {clockTime.toLocaleTimeString()}
          </Text>
          <Text style={styles.dateDisplay}>
            {clockTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text
            style={[
              styles.statusText,
              isClockedIn ? styles.clockedInText : styles.clockedOutText,
            ]}
          >
            {isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
          </Text>

          {isClockedIn && currentSession && (
            <View style={styles.sessionInfoContainer}>
              <Text style={styles.sessionInfoLabel}>Clocked in at:</Text>
              <Text style={styles.sessionInfoValue}>
                {new Date(
                  currentSession.clockInTime.toDate()
                ).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[
            styles.clockButton,
            isClockedIn ? styles.clockOutButton : styles.clockInButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleClockInOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.clockButtonText}>
              {isClockedIn ? "CLOCK OUT" : "CLOCK IN"}
            </Text>
          )}
        </TouchableOpacity>

        {lastLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Last Location:</Text>
            <Text style={styles.locationText}>
              Lat: {lastLocation.coords.latitude.toFixed(6)}, Lon:{" "}
              {lastLocation.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationAccuracy}>
              Accuracy: ±{Math.round(lastLocation.coords.accuracy)} meters
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  timeLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  dateDisplay: {
    fontSize: 18,
    color: "#34495e",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  statusLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  clockedInText: {
    color: "#27ae60",
  },
  clockedOutText: {
    color: "#e74c3c",
  },
  sessionInfoContainer: {
    alignItems: "center",
  },
  sessionInfoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  sessionInfoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#34495e",
  },
  clockButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  clockInButton: {
    backgroundColor: "#27ae60",
  },
  clockOutButton: {
    backgroundColor: "#e74c3c",
  },
  disabledButton: {
    opacity: 0.7,
  },
  clockButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  locationContainer: {
    alignItems: "center",
    marginTop: 16,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  locationLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: "#95a5a6",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 8,
    textAlign: "center",
  },
});

export default ClockInOutScreen;
