import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { User, UserLocation } from "../../types";
import LoadingLogo from "../../components/loading/LoadingLogo";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingStackParamList } from "../../types/navigation";
import { COLLECTIONS } from "../../constants/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import MainPageHeader from "../../components/MainPageHeader";
import LocationModal from "../../components/modals/LocationModal";
import { updateOneDocInDB } from "../../services/firebase/firebaseHelper";
import CurrencyModal from "../../components/modals/CurrencyModal";
import { CURRENCIES } from "../../constants/currencies";
import { useUserPreference } from "../../hooks/useUserPreference";
import UnitModal from "../../components/modals/UnitModal";
import { UNITS } from "../../constants/units";
import { useAuth } from "../../contexts/AuthContext";

type SettingScreenNavigationProp =
  NativeStackNavigationProp<SettingStackParamList>;

const getCurrencySymbol = (code: string) => {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency ? `${code} (${currency.symbol})` : code;
};

const SettingPage = () => {
  const navigation = useNavigation<SettingScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isWeightUnitModalVisible, setIsWeightUnitModalVisible] =
    useState(false);
  const { user, logout } = useAuth();

  const userId = "user123"; // TODO: get from auth
  const {
    loading: userPreferenceLoading,
    error: userPreferenceError,
    preferences,
    formatCurrency,
    formatLocation,
    updateCurrency,
    updateLocation,
  } = useUserPreference(userId);

  useEffect(() => {
    setLoading(true);

    const userDocRef = doc(db, COLLECTIONS.USERS, userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as User;;
        } else {
          console.error("User document does not exist");
          Alert.alert(
            "Error",
            "User data not found. Please create a user profile first.",
            [
              {
                text: "Go to Profile",
                onPress: () => navigation.navigate("EditProfile"),
              },
              { text: "Cancel" },
            ]
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to user data:", error);
        Alert.alert("Error", "Failed to load user data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((previousState) => !previousState);
  };

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleUpdateLocation = async (newLocation: UserLocation) => {
    try {
      await updateOneDocInDB(COLLECTIONS.USERS, userId, {
        location: newLocation,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update location");
    }
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    try {
      await updateOneDocInDB(COLLECTIONS.USERS, userId, {
        preferred_currency: newCurrency,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error updating currency:", error);
      Alert.alert("Error", "Failed to update currency");
    }
  };

  const handleUpdateUnit = async (newUnit: string) => {
    try {
      await updateOneDocInDB(COLLECTIONS.USERS, userId, {
        preferred_unit: newUnit,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error updating unit:", error);
      Alert.alert("Error", "Failed to update unit");
    }
  };

  if (userPreferenceLoading || loading) {
    return <LoadingLogo />;
  }

  if (userPreferenceError || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {userPreferenceError || "No preferences found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.log(error)
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <ScrollView>
        <MainPageHeader title="Setting" />

        {/* User Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={navigateToEditProfile}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Avatar</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <Text style={styles.chevron}>{">"}</Text>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={navigateToEditProfile}
          >
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={navigateToChangePassword}
          >
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <Text style={styles.settingLabel}>Logout</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </TouchableOpacity>
          
        </View>

        {/* Preference Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preference</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsLocationModalVisible(true)}
          >
            <Text style={styles.settingLabel}>Location</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.settingValue}>
                {preferences.location
                  ? formatLocation(preferences.location)
                  : "Not set"}
              </Text>
              <Text style={styles.chevron}>{">"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsCurrencyModalVisible(true)}
          >
            <Text style={styles.settingLabel}>Currency</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.settingValue}>
                {formatCurrency(preferences.currency)}
              </Text>
              <Text style={styles.chevron}>{">"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsWeightUnitModalVisible(true)}
          >
            <Text style={styles.settingLabel}>Weight Unit</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.settingValue}>
                {user?.preferred_unit}
              </Text>
              <Text style={styles.chevron}>{">"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <LocationModal
          visible={isLocationModalVisible}
          onClose={() => setIsLocationModalVisible(false)}
          onSave={handleUpdateLocation}
          initialLocation={user?.location as unknown as UserLocation}
        />

        <CurrencyModal
          visible={isCurrencyModalVisible}
          onClose={() => setIsCurrencyModalVisible(false)}
          onSave={handleUpdateCurrency}
          initialCurrency={user?.preferred_currency || "USD"}
        />

        <UnitModal
          visible={isWeightUnitModalVisible}
          onClose={() => setIsWeightUnitModalVisible(false)}
          onSave={handleUpdateUnit}
          initialUnit={user?.preferred_unit||""}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  chevron: {
    fontSize: 20,
    color: "#ccc",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  settingLabel: {
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
  },
  togglePlaceholder: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 12,
    color: "#666",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
