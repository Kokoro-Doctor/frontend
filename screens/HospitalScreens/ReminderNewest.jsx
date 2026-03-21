import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar"; // Import the sidebar component

const ReminderScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [reminders, setReminders] = useState([
    {
      id: 1,
      time: "09:00",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
    {
      id: 2,
      time: "09:00",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
    {
      id: 3,
      time: "09:00",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
  ]);

  const reminderTypes = ["All Types", "Routine Checkup", "Follow-up", "Emergency"];
  const reminderStatuses = ["All Status", "Enabled", "Disabled"];

  const toggleReminder = (id) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Types" || reminder.title === selectedType;
    const matchesStatus = selectedStatus === "All Status" || 
                         (selectedStatus === "Enabled" && reminder.enabled) ||
                         (selectedStatus === "Disabled" && !reminder.enabled);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <View style={styles.container}>
      {/* Side Navigation Bar */}
      <View style={styles.sidebarContainer}>
        <NewestSidebar activeItem="Reminder" />
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <Text style={styles.screenTitle}>Reminder</Text>
        
        {/* Search and Filter Section */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Appointment"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            {/* Type Dropdown */}
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowStatusDropdown(false);
              }}
            >
              <Text style={styles.filterButtonText}>{selectedType}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#888" />
            </TouchableOpacity>
            
            {/* Status Dropdown */}
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowTypeDropdown(false);
              }}
            >
              <Text style={styles.filterButtonText}>{selectedStatus}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#888" />
            </TouchableOpacity>
            
            {/* New Reminder Button */}
            <TouchableOpacity style={styles.newReminderButton}>
              <MaterialIcons name="add" size={20} color="#FFF" />
              <Text style={styles.newReminderText}>New Reminder</Text>
            </TouchableOpacity>
            
            {/* Notification Icon */}
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialIcons name="notifications" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Type Dropdown Menu */}
          {showTypeDropdown && (
            <View style={[styles.dropdown, { top: 130, left: '26%' }]}>
              {reminderTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Status Dropdown Menu */}
          {showStatusDropdown && (
            <View style={[styles.dropdown, { top: 130, left: '41%' }]}>
              {reminderStatuses.map((status, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStatus(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Reminders Cards Grid */}
        <ScrollView style={styles.remindersContainer} contentContainerStyle={styles.reminderGrid}>
          {filteredReminders.length > 0 ? (
            filteredReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="alarm" size={20} color="#FF7072" />
                  </View>
                  <Text style={styles.patientName}>{reminder.patient}</Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeLabel}>[{reminder.time}] AM</Text>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>{reminder.priority}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.enableButton}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <Text style={styles.buttonText}>Enable</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.snoozeButton}>
                    <Text style={styles.buttonText}>Snooze</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No reminders found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFF",
  },
  sidebarContainer: {
    width: "15%",
    height: "100%",
  },
  mainContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDF8F8",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E6E9FF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    position: "relative",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "40%",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    width: 120,
  },
  filterButtonText: {
    color: "#333",
    fontSize: 14,
  },
  newReminderButton: {
    backgroundColor: "#FF7072",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  newReminderText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  notificationButton: {
    padding: 8,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemText: {
    color: "#333",
    fontSize: 14,
  },
  remindersContainer: {
    flex: 1,
  },
  reminderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reminderCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    width: "32%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  patientName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  priorityBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: "#FFA000",
    fontSize: 12,
    fontWeight: "500",
  },
  reminderContent: {
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 15,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  enableButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  snoozeButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    color: "#666",
    fontSize: 16,
  },
});

export default ReminderScreen;