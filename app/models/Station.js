/**
 * Station Model
 * Represents a station where employees can clock in and out
 */

// Station object structure
export const StationModel = {
  id: "", // Firestore document ID
  name: "", // Station name
  address: "", // Physical address
  isActive: true, // Whether the station is active
  createdAt: null, // Timestamp when the station was created
  createdBy: "", // UID of admin who created the station
  updatedAt: null, // Timestamp when the station was last updated
  updatedBy: "", // UID of admin who last updated the station
};

// Pre-defined stations
export const DEFAULT_STATIONS = [
  {
    name: "Somerset Westview Nairobi",
    address: "Nairobi, Kenya",
    isActive: true,
  },
  {
    name: "Villa Rosa Kempinski",
    address: "Nairobi, Kenya",
    isActive: true,
  },
  {
    name: "Sankara Nairobi",
    address: "Nairobi, Kenya",
    isActive: true,
  },
];
