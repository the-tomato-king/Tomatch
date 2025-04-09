import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth } from '../../services/firebase/firebaseConfig';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password should be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            const user = auth.currentUser;
            
            if (!user || !user.email) {
                throw new Error("User not found");
            }

            // Re-authenticate user before changing password
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, newPassword);
            
            Alert.alert(
                "Success", 
                "Your password has been updated successfully",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            let errorMessage = "Failed to change password";
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = "Current password is incorrect";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button 
                title={loading ? "Updating..." : "Update Password"}
                onPress={handleChangePassword}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    }
});

export default ChangePasswordScreen;