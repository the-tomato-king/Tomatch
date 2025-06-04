import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { User } from "../../types";
import LoadingLogo from "../../components/loading/LoadingLogo";
import { colors } from "../../theme/colors";
import {
  readOneDoc,
  updateOneDocInDB,
} from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { getAuth, verifyBeforeUpdateEmail } from "firebase/auth";
import { EditAvatar } from "../../components/EditAvatar";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (userId) {
          const userData = await readOneDoc<User>(COLLECTIONS.USERS, userId);
          console.log("userData", userData);

          if (userData) {
            setUser(userData);
            setName(userData.name || "");
            setEmail(userData.email || "");
            setPhone(userData.phone_number || "");
          }
        } else {
          Alert.alert("Error", "User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // check if email is modified
      if (email !== user?.email) {
        Alert.alert(
          "Email Update",
          "We will send a verification link to your new email address. You must click that link to complete the email change.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Send Verification",
              onPress: async () => {
                try {
                  if (!auth.currentUser) return;

                  // send verification email to new email
                  await verifyBeforeUpdateEmail(auth.currentUser, email);

                  // update other information first
                  const updatedUserData = {
                    name, 
                    phone_number: phone,
                    email,
                    updated_at: new Date(),
                  };

                  const success = await updateOneDocInDB(
                    COLLECTIONS.USERS,
                    userId as string,
                    updatedUserData
                  );

                  if (success) {
                    Alert.alert(
                      "Verification Email Sent",
                      "Please check your new email inbox and click the verification link to complete the email change. Your other information has been updated.",
                      [{ text: "OK", onPress: () => navigation.goBack() }]
                    );
                  } else {
                    Alert.alert(
                      "Error",
                      "Failed to update profile information"
                    );
                  }
                } catch (error: any) {
                  console.error("Error updating email:", error);
                  let errorMessage = "Failed to update email";

                  if (error.code === "auth/email-already-in-use") {
                    errorMessage =
                      "This email is already registered to another account.";
                  } else if (error.code === "auth/requires-recent-login") {
                    errorMessage =
                      "For security reasons, please log out and log back in before changing your email.";
                  }

                  Alert.alert("Error", errorMessage);
                }
              },
            },
          ]
        );
        return;
      }

      // if email is not modified, update other information directly
      await updateUserDocument();
    } catch (error) {
      console.error("Error updating user data:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updateUserDocument = async () => {
    const updatedUserData = {
      name,
      phone_number: phone,
      email,
      updated_at: new Date(),
    };

    // note: no longer update email here, email update will be handled by Firebase after verification
    const success = await updateOneDocInDB(
      COLLECTIONS.USERS,
      userId as string,
      updatedUserData
    );

    if (success) {
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <EditAvatar
          userId={userId as string}
          avatarUrl={user?.avatar_url}
          userName={user?.name}
          onAvatarUpdate={(newAvatarUrl) => {
            setUser((prev) =>
              prev ? { ...prev, avatar_url: newAvatarUrl } : null
            );
          }}
        />

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
