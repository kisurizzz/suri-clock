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
  Modal,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../../contexts/AuthContext";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { getAllStations } from "../../services/stationService";

const ClockInOutScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [clockTime, setClockTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationModalVisible, setStationModalVisible] = useState(false);

  // Check clock status
  useEffect(() => {
    if (currentUser) {
      checkClockStatus();
      fetchVehicles();
      fetchStations();
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

  const fetchStations = async () => {
    try {
      const stationsList = await getAllStations(true); // Only get active stations
      setStations(stationsList);
    } catch (error) {
      console.error("Error fetching stations:", error);
      Alert.alert("Error", "Failed to load stations");
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehiclesRef = collection(db, "vehicles");
      const vehiclesQuery = query(vehiclesRef, orderBy("make"));
      const querySnapshot = await getDocs(vehiclesQuery);

      const vehiclesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

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
          if (userData.currentSession.vehicle) {
            setSelectedVehicle(userData.currentSession.vehicle);
          }
          if (userData.currentSession.station) {
            setSelectedStation(userData.currentSession.station);
          }
        } else {
          setIsClockedIn(false);
          setCurrentSession(null);
          setSelectedVehicle(null);
          setSelectedStation(null);
        }
      } else {
        setIsClockedIn(false);
        setCurrentSession(null);
        setSelectedVehicle(null);
        setSelectedStation(null);
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

  const handleShowVehicleModal = () => {
    if (vehicles.length === 0) {
      Alert.alert(
        "No Vehicles Available",
        "Please contact an administrator to add vehicles to the fleet."
      );
      return;
    }
    setVehicleModalVisible(true);
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleModalVisible(false);
  };

  const handleShowStationModal = () => {
    if (stations.length === 0) {
      Alert.alert(
        "No Stations Available",
        "Please contact an administrator to add stations."
      );
      return;
    }
    setStationModalVisible(true);
  };

  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setStationModalVisible(false);
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
        // For clock in, ensure a vehicle and station are selected
        if (!selectedVehicle) {
          Alert.alert(
            "Vehicle Required",
            "Please select a vehicle before clocking in."
          );
          setLoading(false);
          return;
        }

        if (!selectedStation) {
          Alert.alert(
            "Station Required",
            "Please select a station before clocking in."
          );
          setLoading(false);
          return;
        }

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
          vehicle: selectedVehicle,
          station: selectedStation,
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
          setSelectedVehicle(null);
          setSelectedStation(null);
          Alert.alert("Success", "You have clocked out successfully");
        }
      }
    } catch (err) {
      console.error("Error clocking in/out:", err);
      Alert.alert("Error", "Failed to clock in/out");
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectVehicle(item)}
    >
      <Text style={styles.modalItemTitle}>
        {item.make} {item.model}
      </Text>
      <Text style={styles.modalItemSubtitle}>
        {item.year} • {item.color} • {item.licensePlate}
      </Text>
    </TouchableOpacity>
  );

  const renderStationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectStation(item)}
    >
      <Text style={styles.modalItemTitle}>{item.name}</Text>
      <Text style={styles.modalItemSubtitle}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.time}>
            {clockTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
          <Text style={styles.date}>
            {clockTime.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text
            style={[
              styles.statusValue,
              isClockedIn ? styles.clockedInText : styles.clockedOutText,
            ]}
          >
            {isClockedIn ? "Clocked In" : "Clocked Out"}
          </Text>

          {currentSession && isClockedIn && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>Clocked in at:</Text>
              <Text style={styles.sessionValue}>
                {new Date(
                  currentSession.clockInTime.toDate()
                ).toLocaleTimeString()}
              </Text>

              {selectedVehicle && (
                <View style={styles.infoRow}>
                  <Text style={styles.sessionLabel}>Vehicle:</Text>
                  <Text style={styles.sessionValue}>
                    {selectedVehicle.make} {selectedVehicle.model} -{" "}
                    {selectedVehicle.licensePlate}
                  </Text>
                </View>
              )}

              {selectedStation && (
                <View style={styles.infoRow}>
                  <Text style={styles.sessionLabel}>Station:</Text>
                  <Text style={styles.sessionValue}>
                    {selectedStation.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!isClockedIn && (
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Select Vehicle & Station</Text>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={handleShowVehicleModal}
            >
              <Text style={styles.selectionButtonLabel}>Vehicle</Text>
              <Text style={styles.selectionButtonValue}>
                {selectedVehicle
                  ? `${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.licensePlate}`
                  : "Select a vehicle"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={handleShowStationModal}
            >
              <Text style={styles.selectionButtonLabel}>Station</Text>
              <Text style={styles.selectionButtonValue}>
                {selectedStation ? selectedStation.name : "Select a station"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              {isClockedIn ? "Clock Out" : "Clock In"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vehicleModalVisible}
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle</Text>
              <TouchableOpacity
                onPress={() => setVehicleModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={vehicles}
              renderItem={renderVehicleItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Station Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={stationModalVisible}
        onRequestClose={() => setStationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Station</Text>
              <TouchableOpacity
                onPress={() => setStationModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={stations}
              renderItem={renderStationItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  time: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  date: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 8,
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 10,
    textAlign: "center",
  },
  statusContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clockedInText: {
    color: "#27ae60",
  },
  clockedOutText: {
    color: "#e74c3c",
  },
  sessionInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sessionLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  sessionValue: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
  },
  infoRow: {
    marginVertical: 4,
  },
  selectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  selectionButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectionButtonLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  selectionButtonValue: {
    fontSize: 16,
    color: "#2c3e50",
  },
  clockButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});

export default ClockInOutScreen;
