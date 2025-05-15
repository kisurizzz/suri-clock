import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const VehicleManagementScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    color: "",
    registrationNumber: "",
  });
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
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
      Alert.alert("Error", "Failed to load vehicles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.make || !formData.model || !formData.registrationNumber) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editingVehicle) {
        // Update existing vehicle
        const vehicleRef = doc(db, "vehicles", editingVehicle.id);
        await updateDoc(vehicleRef, {
          ...formData,
          updatedAt: new Date(),
          updatedBy: currentUser.uid,
        });
        Alert.alert("Success", "Vehicle updated successfully");
      } else {
        // Add new vehicle
        await addDoc(collection(db, "vehicles"), {
          ...formData,
          createdAt: new Date(),
          createdBy: currentUser.uid,
          status: "active",
        });
        Alert.alert("Success", "Vehicle added successfully");
      }

      // Reset form and refresh list
      setFormData({
        make: "",
        model: "",
        color: "",
        registrationNumber: "",
      });
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      Alert.alert("Error", "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color || "",
      registrationNumber: vehicle.registrationNumber,
    });
  };

  const handleDelete = (vehicle) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, "vehicles", vehicle.id));
              Alert.alert("Success", "Vehicle deleted successfully");
              fetchVehicles();
            } catch (error) {
              console.error("Error deleting vehicle:", error);
              Alert.alert("Error", "Failed to delete vehicle");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleItem}>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleTitle}>
          {item.make} {item.model}
        </Text>
        <Text style={styles.vehicleDetails}>
          Reg: {item.registrationNumber}
          {item.color ? ` • Color: ${item.color}` : ""}
        </Text>
      </View>
      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Make *"
          value={formData.make}
          onChangeText={(text) => setFormData({ ...formData, make: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Model *"
          value={formData.model}
          onChangeText={(text) => setFormData({ ...formData, model: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Color"
          value={formData.color}
          onChangeText={(text) => setFormData({ ...formData, color: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Registration Number *"
          value={formData.registrationNumber}
          onChangeText={(text) =>
            setFormData({ ...formData, registrationNumber: text })
          }
        />

        <View style={styles.formButtonsContainer}>
          {editingVehicle && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setEditingVehicle(null);
                setFormData({
                  make: "",
                  model: "",
                  color: "",
                  registrationNumber: "",
                });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {editingVehicle ? "Update" : "Add"} Vehicle
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Vehicle Fleet</Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderVehicleItem}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No vehicles found</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  formButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  vehicleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  vehicleDetails: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  vehicleActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#f39c12",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#7f8c8d",
    fontSize: 16,
  },
});

export default VehicleManagementScreen;
