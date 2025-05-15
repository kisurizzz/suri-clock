import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

const EmployeeListScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const employeesQuery = query(
        collection(db, "users"),
        orderBy("firstName", "asc")
      );

      const querySnapshot = await getDocs(employeesQuery);
      const employeesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const handleEmployeePress = (employee) => {
    navigation.navigate("EmployeeDetails", { userId: employee.id });
  };

  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => handleEmployeePress(item)}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.employeeEmail}>{item.email}</Text>
      </View>
      <View style={styles.employeeRole}>
        <Text
          style={[
            styles.roleText,
            item.role === "admin" ? styles.adminRole : styles.employeeRole,
          ]}
        >
          {item.role === "admin" ? "Admin" : "Employee"}
        </Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Manage Employees</Text>
      </View>

      <FlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No employees found</Text>
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
  employeeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  employeeRole: {
    marginLeft: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  adminRole: {
    backgroundColor: "#3498db",
    color: "#fff",
  },
  employeeRole: {
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    fontSize: 16,
    marginTop: 20,
  },
});

export default EmployeeListScreen;
