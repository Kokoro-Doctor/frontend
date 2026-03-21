import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ReminderScreen = ({ navigation }) => {
  // Refs for positioning and measuring
  const newReminderButtonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [reminders, setReminders] = useState([
    {
      id: 1,
      time: "9:00 AM",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
    {
      id: 2,
      time: "9:00 AM",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
    {
      id: 3,
      time: "9:00 AM",
      priority: "Medium",
      title: "Routine Checkup",
      patient: "Sarah Johnson",
      enabled: true,
    },
  ]);

  // Add Reminder Modal State
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    patient: "Patient X",
    date: "",
    time: "",
    description: "",
    pushNotification: true,
    emailNotification: false,
    smsNotification: false,
    priority: "Medium",
    repeat: "None",
  });

  // Date & Time picker state
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("Medium");

  // Effect to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTypeDropdown(false);
      setShowStatusDropdown(false);
    };

    // Add event listener only when dropdowns are open
    if (showTypeDropdown || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeDropdown, showStatusDropdown]);

  // Measure and store the position of the New Reminder button for modal positioning
  const measureButton = () => {
    if (newReminderButtonRef.current) {
      newReminderButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setButtonPosition({ x: pageX, y: pageY, width, height });
      });
    }
  };

  // Toggle functions
  const toggleReminder = (id) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const toggleNotification = (type, value) => {
    setNewReminder(prev => ({ ...prev, [type]: value }));
  };

  // Date & Time picker handlers
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
    setNewReminder({...newReminder, date: formattedDate});
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleConfirmTime = (time) => {
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setNewReminder({...newReminder, time: formattedTime});
    hideTimePicker();
  };

  // Add new reminder
  const handleAddReminder = () => {
    const newId = reminders.length > 0 ? Math.max(...reminders.map(r => r.id)) + 1 : 1;
    
    const addedReminder = {
      id: newId,
      time: newReminder.time || "9:00 AM",
      priority: newReminder.priority,
      title: newReminder.title || "Reminder",
      patient: newReminder.patient || "Patient X",
      enabled: true,
    };

    setReminders([...reminders, addedReminder]);
    setShowAddReminder(false);
    resetNewReminder();
  };

  const resetNewReminder = () => {
    setNewReminder({
      title: "",
      patient: "Patient X",
      date: "",
      time: "",
      description: "",
      pushNotification: true,
      emailNotification: false,
      smsNotification: false,
      priority: "Medium",
      repeat: "None",
    });
  };

  // Open Add Reminder modal with proper positioning
  const openAddReminderModal = () => {
    measureButton();
    setShowAddReminder(true);
  };

  // Filter reminders
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
      {/* Sidebar */}
      <View style={styles.sideBarContainer}>
        <NewestSidebar activeItem="Reminder" navigation={navigation} />
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <Text style={styles.screenTitle}>Reminder</Text>
        
        {/* Search and Filter Section */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchFilterWrapper}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Appointment"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={styles.filterContainer}>
              {/* Type Dropdown */}
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={styles.filterButtonText}>{selectedType}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#666" />
                </TouchableOpacity>
                
                {showTypeDropdown && (
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View style={[styles.dropdown, { zIndex: 1000 }]}>
                      {["All Types", "Routine Checkup", "Follow-up", "Emergency"].map((type, index) => (
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
                  </TouchableWithoutFeedback>
                )}
              </View>
              
              {/* Status Dropdown */}
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text style={styles.filterButtonText}>{selectedStatus}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#666" />
                </TouchableOpacity>
                
                {showStatusDropdown && (
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View style={[styles.dropdown, { zIndex: 1000 }]}>
                      {["All Status", "Enabled", "Disabled"].map((status, index) => (
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
                  </TouchableWithoutFeedback>
                )}
              </View>
            </View>
          </View>

          <View style={styles.rightActionButtons}>
            {/* Add Reminder Button */}
            <TouchableOpacity 
              ref={newReminderButtonRef}
              style={styles.addReminderButton}
              onPress={openAddReminderModal}
              onLayout={measureButton}
            >
              <MaterialIcons name="add" size={18} color="#FFF" />
              <Text style={styles.addReminderButtonText}>New Reminder</Text>
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialIcons name="notifications-none" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Reminders List - Horizontal Layout */}
        <FlatList
          data={filteredReminders}
          horizontal={false}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reminderListContainer}
          columnWrapperStyle={styles.reminderCardRow}
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No reminders found</Text>
            </View>
          }
          renderItem={({item}) => (
            <View style={styles.reminderCard}>
              <View style={styles.reminderCardLeft}>
                <MaterialIcons name="alarm" size={22} color="#FF7072" />
              </View>

              <View style={styles.reminderCardContent}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.patientName}>{item.patient}</Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>[{item.time}]</Text>
                  </View>
                  <View style={[
                    styles.priorityBadge,
                    item.priority === "High" && styles.highPriority,
                    item.priority === "Medium" && styles.mediumPriority,
                    item.priority === "Low" && styles.lowPriority,
                  ]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                </View>
                <Text style={styles.reminderTitle}>{item.title}</Text>
                
                <View style={styles.reminderActions}>
                  <TouchableOpacity 
                    style={styles.enableButton}
                    onPress={() => toggleReminder(item.id)}
                  >
                    <Text style={styles.enableButtonText}>Enable</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.snoozeButton}>
                    <Text style={styles.snoozeButtonText}>Snooze</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* Add Reminder Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAddReminder}
        onRequestClose={() => setShowAddReminder(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddReminder(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View 
          style={[
            styles.addReminderContainer,
            {
              top: buttonPosition.y + buttonPosition.height + 10,
              right: Dimensions.get('window').width - (buttonPosition.x + buttonPosition.width),
              transform: [{ translateX: 0 }, { translateY: 0 }], // Reset transform
            }
          ]}
        >
          <View style={styles.addReminderHeader}>
            <Text style={styles.addReminderTitle}>Add Reminder</Text>
            <TouchableOpacity onPress={() => setShowAddReminder(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.addReminderForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reminder title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Patient X"
                value={newReminder.title}
                onChangeText={(text) => setNewReminder({...newReminder, title: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TouchableOpacity style={styles.formInput} onPress={showDatePicker}>
                <Text style={newReminder.date ? styles.dateTimeText : styles.dateTimePlaceholder}>
                  {newReminder.date || "DD/MM/YYYY"}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Time</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity style={styles.timeInput} onPress={showTimePicker}>
                    <Text style={newReminder.time ? styles.dateTimeText : styles.dateTimePlaceholder}>
                      {newReminder.time ? newReminder.time.split(' ')[0] : "00:00"}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.amPmContainer}>
                    <Text style={styles.amPmText}>
                      {newReminder.time ? newReminder.time.split(' ')[1] : "AM"}
                    </Text>
                  </View>
                </View>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity style={styles.timeInput} onPress={showTimePicker}>
                    <Text style={styles.dateTimePlaceholder}>00:00</Text>
                  </TouchableOpacity>
                  <View style={styles.amPmContainer}>
                    <Text style={styles.amPmText}>AM</Text>
                  </View>
                </View>
              </View>
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Add Description</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter description"
                multiline
                value={newReminder.description}
                onChangeText={(text) => setNewReminder({...newReminder, description: text})}
              />
            </View>
            
            {/* Notification Toggles */}
            <View style={styles.notificationToggles}>
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationText}>Push Notification</Text>
                <Switch
                  value={newReminder.pushNotification}
                  onValueChange={(value) => toggleNotification('pushNotification', value)}
                  trackColor={{ false: "#d9d9d9", true: "#b3d9ff" }}
                  thumbColor={newReminder.pushNotification ? "#4287f5" : "#f4f3f4"}
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationText}>Email Notification</Text>
                <Switch
                  value={newReminder.emailNotification}
                  onValueChange={(value) => toggleNotification('emailNotification', value)}
                  trackColor={{ false: "#d9d9d9", true: "#b3d9ff" }}
                  thumbColor={newReminder.emailNotification ? "#4287f5" : "#f4f3f4"}
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationText}>SMS Notification</Text>
                <Switch
                  value={newReminder.smsNotification}
                  onValueChange={(value) => toggleNotification('smsNotification', value)}
                  trackColor={{ false: "#d9d9d9", true: "#b3d9ff" }}
                  thumbColor={newReminder.smsNotification ? "#4287f5" : "#f4f3f4"}
                />
              </View>
            </View>
            
            {/* Priority Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityOptions}>
                {['Low', 'Medium', 'High'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority && styles.priorityOptionSelected,
                      priority === 'Low' && { backgroundColor: selectedPriority === priority ? '#4CAF50' : '#E8F5E9' },
                      priority === 'Medium' && { backgroundColor: selectedPriority === priority ? '#FF9800' : '#FFF8E1' },
                      priority === 'High' && { backgroundColor: selectedPriority === priority ? '#F44336' : '#FFEBEE' },
                    ]}
                    onPress={() => {
                      setSelectedPriority(priority);
                      setNewReminder({...newReminder, priority});
                    }}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      selectedPriority === priority && styles.priorityOptionSelectedText,
                      priority === 'Low' && { color: selectedPriority === priority ? '#fff' : '#388E3C' },
                      priority === 'Medium' && { color: selectedPriority === priority ? '#fff' : '#FFA000' },
                      priority === 'High' && { color: selectedPriority === priority ? '#fff' : '#D32F2F' },
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Repeat Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Repeat</Text>
              <TouchableOpacity style={styles.repeatContainer}>
                <Text style={styles.repeatText}>None</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Save/Cancel Buttons */}
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddReminder}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowAddReminder(false);
                resetNewReminder();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFF",
  },
  sideBarContainer: {
    width: "15%",
    backgroundColor: "#f5f5f5",
  },
  mainContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
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
    backgroundColor: "#F0F0FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    zIndex: 20,
  },
  searchFilterWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    borderRadius: 8,
    width: 250, // Adjusted based on image
    height: 40,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightActionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownWrapper: {
    position: "relative",
    marginRight: 10,
    zIndex: 100,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: 110, // Adjusted width to match image
    height: 40,
  },
  filterButtonText: {
    color: "#333",
    fontSize: 14,
    marginRight: 5,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    left: 0,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 110,
    width: "100%",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    color: "#333",
    fontSize: 14,
  },
  addReminderButton: {
    backgroundColor: "#FF7072",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    width: 150, // Increased width for the New Reminder button
  },
  addReminderButtonText: {
    color: "#FFF",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 5,
  },
  notificationButton: {
    marginLeft: 15,
  },
  // Reminder List and Card Styles
  reminderListContainer: {
    padding: 10,
    flexGrow: 1,
  },
  reminderCardRow: {
    justifyContent: 'space-between',
    marginBottom: 20, // Add vertical spacing between rows
  },
  reminderCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    width: '31%', // Make cards take up 31% of width to create spacing
  },
  reminderCardLeft: {
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  reminderCardContent: {
    flex: 1,
    padding: 15,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // Allow wrapping if needed
    marginBottom: 5,
  },
  patientName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginRight: 8, // Add spacing between name and time
  },
  timeContainer: {
    marginRight: 8, // Add spacing between time and priority badge
  },
  timeText: {
    color: "#666",
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  highPriority: {
    backgroundColor: "#FFEBEE",
  },
  mediumPriority: {
    backgroundColor: "#FFF8E1",
  },
  lowPriority: {
    backgroundColor: "#E8F5E9",
  },
  priorityText: {
    fontSize: 12,
    color: "#D32F2F",
  },
  reminderTitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  enableButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  enableButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  snoozeButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  snoozeButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  noResultsText: {
    color: "#999",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  addReminderContainer: {
    position: "absolute",
    // Position will be set dynamically based on the New Reminder button
    width: 350, // Width from the image
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 500,
    zIndex: 1000,
  },
  addReminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addReminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addReminderForm: {
    flex: 1,
    maxHeight: 380,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    color: "#555",
    marginBottom: 5,
    fontSize: 14,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFF",
    height: 40,
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  

  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFF",
    height: 40,
    justifyContent: "center", 
  },
  amPmContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    backgroundColor: "#FFF",
  },
  amPmText: {
    fontSize: 14,
    color: "#333",
  },
  amPmText: {
    fontSize: 14,
    color: "#333",
  },
  dateTimeText: {
    fontSize: 14,
    color: "#333",
  },
  dateTimePlaceholder: {
    fontSize: 14,
    color: "#999",
  },
  notificationToggles: {
    marginBottom: 15,
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
  },
  priorityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  priorityOptionSelected: {
    borderWidth: 0,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  priorityOptionSelectedText: {
    color: "#FFF",
  },
  repeatContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    height: 40,
  },
  repeatText: {
    fontSize: 14,
    color: "#333",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  
  
  saveButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
  },
});

export default ReminderScreen;