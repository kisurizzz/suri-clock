import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAllStations,
  addStation,
  updateStation,
  toggleStationStatus,
} from "../../services/stationService";

const StationManagementScreen = () => {
  const { currentUser } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [stationName, setStationName] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [stationActive, setStationActive] = useState(true);

  // Load stations
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const stationsList = await getAllStations(false); // Get all stations, including inactive
      setStations(stationsList);
    } catch (error) {
      console.error("Error fetching stations:", error);
      Alert.alert("Error", "Failed to load stations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStations();
  };

  const handleCreateStation = () => {
    setEditMode(false);
    setCurrentStation(null);
    setStationName("");
    setStationAddress("");
    setStationActive(true);
    setModalVisible(true);
  };

  const handleEditStation = (station) => {
    setEditMode(true);
    setCurrentStation(station);
    setStationName(station.name);
    setStationAddress(station.address);
    setStationActive(station.isActive);
    setModalVisible(true);
  };

  const handleToggleStationStatus = async (station) => {
    try {
      setLoading(true);
      await toggleStationStatus(station.id, !station.isActive, currentUser.uid);

      // Update local state
      setStations(
        stations.map((s) =>
          s.id === station.id ? { ...s, isActive: !s.isActive } : s
        )
      );

      Alert.alert(
        "Success",
        `Station ${station.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling station status:", error);
      Alert.alert("Error", "Failed to update station status");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStation = async () => {
    if (!stationName.trim() || !stationAddress.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const stationData = {
        name: stationName.trim(),
        address: stationAddress.trim(),
        isActive: stationActive,
      };

      if (editMode && currentStation) {
        // Update existing station
        await updateStation(currentStation.id, stationData, currentUser.uid);

        // Update local state
        setStations(
          stations.map((s) =>
            s.id === currentStation.id ? { ...s, ...stationData } : s
          )
        );

        Alert.alert("Success", "Station updated successfully");
      } else {
        // Create new station
        const newStation = await addStation(stationData, currentUser.uid);

        // Update local state
        setStations([...stations, newStation]);

        Alert.alert("Success", "Station created successfully");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving station:", error);
      Alert.alert("Error", "Failed to save station");
    } finally {
      setLoading(false);
    }
  };

  const renderStationItem = ({ item }) => (
    <View style={[styles.stationCard, !item.isActive && styles.inactiveCard]}>
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationAddress}>{item.address}</Text>
        <Text
          style={[
            styles.stationStatus,
            item.isActive ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {item.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditStation(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.isActive ? styles.deactivateButton : styles.activateButton,
          ]}
          onPress={() => handleToggleStationStatus(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.isActive ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Station Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateStation}
        >
          <Text style={styles.addButtonText}>+ Add Station</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stations}
        renderItem={renderStationItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stations found</Text>
        }
      />

      {/* Station Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Station" : "Add New Station"}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Station Name*</Text>
              <TextInput
                style={styles.input}
                value={stationName}
                onChangeText={setStationName}
                placeholder="Enter station name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address*</Text>
              <TextInput
                style={styles.input}
                value={stationAddress}
                onChangeText={setStationAddress}
                placeholder="Enter station address"
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Active</Text>
              <Switch
                value={stationActive}
                onValueChange={setStationActive}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={stationActive ? "#2271b1" : "#f4f3f4"}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveStation}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#2271b1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 24,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  inactiveCard: {
    borderLeftColor: "#9e9e9e",
    opacity: 0.8,
  },
  stationInfo: {
    marginBottom: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  stationStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeStatus: {
    color: "#4caf50",
  },
  inactiveStatus: {
    color: "#9e9e9e",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: "#3498db",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deactivateButton: {
    backgroundColor: "#e74c3c",
  },
  activateButton: {
    backgroundColor: "#2ecc71",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#2271b1",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StationManagementScreen;
