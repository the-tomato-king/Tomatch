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
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";
import MainPageHeader from "../../components/MainPageHeader";
import LocationModal from "../../components/modals/LocationModal";
import { updateOneDocInDB } from "../../services/firebase/firebaseHelper";
import CurrencyModal from "../../components/modals/CurrencyModal";
import { CURRENCIES } from "../../constants/currencies";
import { useUserPreference } from "../../hooks/useUserPreference";
import UnitModal from "../../components/modals/UnitModal";
import { UNITS } from "../../constants/units";
import { useAuth } from "../../contexts/AuthContext";
import { createUserDocument } from "../../services/userService";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

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
  const { userId } = useAuth();

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
          const userData = docSnapshot.data() as User;
          // handle user data...
        } else {
          console.log("Creating initial user document...");
          // if user document does not exist, try to create
          createUserDocument(userId, auth.currentUser?.email || "").catch(
            (error) => {
              console.error("Error creating user document:", error);
              Alert.alert(
                "Error",
                "Failed to create user profile. Please try again.",
                [
                  {
                    text: "Retry",
                    onPress: () => navigation.navigate("EditProfile"),
                  },
                  { text: "Cancel" },
                ]
              );
            }
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
  }, [userId]);

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
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.log(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Account Deletion",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("User canceled the delete operation"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              if (!user) {
                console.log("No user logged in");
                return;
              }

              // 1. delete user data in Firestore
              await deleteDoc(doc(db, COLLECTIONS.USERS, user.uid));

              // 2. delete all user_products data
              const userProductsRef = collection(
                db,
                COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS
              );
              const q = query(
                userProductsRef,
                where("user_id", "==", user.uid)
              );
              const querySnapshot = await getDocs(q);
              const batch = writeBatch(db);
              querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
              });
              await batch.commit();

              // 3. delete Auth account
              await user.delete();

              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate("Auth"),
                  },
                ]
              );
            } catch (error: any) {
              console.error("Error deleting account:", error);
              if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Re-authentication Required",
                  "Please log out and log in again before deleting your account.",
                  [
                    {
                      text: "OK",
                      onPress: () => logout(),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete account. Please try again."
                );
              }
            }
          },
        },
      ]
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

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={styles.settingLabel}>Logout</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.settingLabel}>Delete My Account</Text>
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
              <Text style={styles.settingValue}>{user?.preferred_unit}</Text>
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
          initialUnit={user?.preferred_unit || ""}
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
