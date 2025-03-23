import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingScreen from "../screens/setting/SettingScreen";
import EditProfileScreen from "../screens/setting/EditProfileScreen";
import { SettingStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<SettingStackParamList>();

const SettingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "Edit Profile",
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingStack;
