import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../store/auth.store";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/passwordpages.styles";
import SafeScreen from "../../constants/SafeScreen";

const ChangePassword = () => {
  const { email, resetCode } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const changePasswordAction = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const result = await resetPassword(email as string, resetCode as string, newPassword);
    
    if (result.success) {
      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/(auth)'),
        },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >
        {/* BACK TO SIGN IN HEADER */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 20, 
        }}>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
            onPress={() => {
              router.dismissAll();
              router.push('/');
            }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.container, { paddingTop: 60 }]}>

        {/* CARD */}
        <View style={styles.card}>
          {/* HEADER */}
          <View style={[styles.header, { marginBottom: 25 }]}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          <View style={styles.formContainer}>

            {/* NEW PASSWORD INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CONFIRM PASSWORD INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* BUTTONS SECTION */}
          <View style={{ marginTop: 10 }}>
            {/* CHANGE PASSWORD BUTTON */}
            <TouchableOpacity
              style={[styles.button, { marginTop: 0 }, isLoading && styles.buttonDisabled]}
              onPress={changePasswordAction}
              disabled={isLoading}
            >
              {
                isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Change Password</Text>
                )}
            </TouchableOpacity>


          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default ChangePassword;