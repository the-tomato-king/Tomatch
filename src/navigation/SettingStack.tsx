import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingScreen from "../screens/setting/SettingScreen";
import EditProfileScreen from "../screens/setting/EditProfileScreen";
import { SettingStackParamList } from "../types/navigation";
import ChangePasswordScreen from "../screens/setting/ChangePasswordScreen";

const Stack = createNativeStackNavigator<SettingStackParamList>();

const SettingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingScreen"
        component={SettingScreen}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          title: "Change Password",
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingStack;
