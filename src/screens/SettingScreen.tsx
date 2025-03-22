import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
} from "react-native";
import React, { useState, useEffect } from "react";
import { User } from "../types";
import LoadingLogo from "../components/LoadingLogo";

const SettingPage = () => {
  // 创建用户状态
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 模拟获取用户数据
  useEffect(() => {
    // 这里应该是从API或本地存储获取用户数据
    // 现在我们使用模拟数据
    const mockUser: User = {
      id: "user101",
      name: "User101",
      email: "user101@gmail.com",
      phone_number: "123-456-7890",
      location: {
        country: "Canada",
        province: "Ontario",
        city: "Toronto",
        street_address: "123 Maple Street",
        postcode: "M5V 2T6",
        coordinates: {
          latitude: 43.6532,
          longitude: -79.3832,
        },
      },
      preferred_unit: {
        weight: "lb",
        volume: "oz",
      },
      preferred_currency: "CAD",
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 模拟网络延迟
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, []);

  // 处理暗黑模式切换
  const toggleDarkMode = () => {
    setDarkMode((previousState) => !previousState);
  };

  // 显示加载状态
  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Setting</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Avatar</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userEmail}>
              {user?.email || "user@example.com"}
            </Text>
          </View>
          <Text style={styles.chevron}>{">"}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </View>
        </View>

        {/* Preference Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preference</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Location</Text>
            <Text style={styles.chevron}>{">"}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingValue}>
              {user?.preferred_currency || "USD"}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Weight Unit</Text>
            <Text style={styles.settingValue}>
              {user?.preferred_unit?.weight || "kg"}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Volume Unit</Text>
            <Text style={styles.settingValue}>
              {user?.preferred_unit?.volume || "ml"}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#eee", true: "#007AFF" }}
              thumbColor={darkMode ? "#fff" : "#fff"}
              ios_backgroundColor="#eee"
              onValueChange={toggleDarkMode}
              value={darkMode}
            />
          </View>
        </View>

        {/* Content will go here */}
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
});
