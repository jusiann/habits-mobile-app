import React from 'react';
import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/passwordpages.styles';
import CustomAlert from '../../constants/CustomAlert';
import SafeScreen from '../../constants/SafeScreen';

export default function ChangePassword() {
  const {email, resetCode} = useLocalSearchParams();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const {resetPassword, isLoading} = useAuthStore();
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const changePasswordAction = async () => {
    if (!newPassword.trim()) {
      setShowAlert({
        visible: true,
        title: 'Error',
        message: 'Please enter a new password',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setShowAlert({
        visible: true,
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      });
      return;
    }

    const result = await resetPassword(email as string, resetCode as string, newPassword);
    if (result.success) {
      setShowAlert({
        visible: true,
        title: 'Success',
        message: 'Password changed successfully!',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.push('/(auth)'); }, style: 'default' }]
      });
    } else {
      setShowAlert({
        visible: true,
        title: 'Error',
        message: result.message || 'An error occurred while changing password',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      });
    }
  };

  return (
    <SafeScreen>
      <CustomAlert
        visible={showAlert.visible}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        buttons={showAlert.buttons}
        onDismiss={() => setShowAlert(previous => ({ ...previous, visible: false }))}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >

        {/* BACK TO SIGN IN HEADER */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 4,
          backgroundColor: COLORS.background
        }}>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => {
              router.dismissAll();
              router.push('/');
            }}
          >
            <Ionicons 
              name="chevron-back" 
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