import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import styles from '../../assets/styles/signup.styles';
import COLORS from "../../constants/colors";
import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useAuthStore } from '@/store/auth.store';

export default function Signup() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { isLoading, register } = useAuthStore();

  const signupAction = async () => {
    // Frontend validation
    if (!username || !email || !fullName || !password) {
      Alert.alert(
        "Missing Information",
        "Username, fullname, email and password are required.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!confirmPassword) {
      Alert.alert(
        "Missing Information",
        "Please confirm your password.",
        [{ text: "OK" }]
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match. Please try again.",
        [{ text: "OK" }]
      );
      return;
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await register(email, username, fullName, password);
      
      if (!result.success) {
        // Backend'den gelen hata mesajını doğrudan kullan
        Alert.alert(
          "Sign Up Failed",
          result.message || "Registration failed",
          [{ text: "OK" }]
        );
        return;
      }

      // Başarılı kayıt
      Alert.alert(
        "Success",
        "Account created successfully!",
        [{ text: "OK" }]
      );
      
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to connect to server. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>
          {/* FORM */}
          <View style={styles.formContainer}>
            {/* USERNAME */}
            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Username</Text> */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Username"
                  placeholderTextColor={COLORS.placeholderText}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>
            {/* EMAIL */}
            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Email</Text> */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Email"
                  placeholderTextColor={COLORS.placeholderText}
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
            {/* FULL NAME */}
            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Full Name</Text> */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Full Name"
                  placeholderTextColor={COLORS.placeholderText}
                  autoCapitalize="none"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>
            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Password</Text> */}
              <View style={styles.inputContainer}>
                {/* LEFT ICON */}
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                {/* INPUT */}
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* CONFIRM PASSWORD */}
            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Confirm Password</Text> */}
              <View style={styles.inputContainer}>
                {/* LEFT ICON */}
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                {/* INPUT */}
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Confirm Password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* SIGNUP BUTTON */}
            <TouchableOpacity style={styles.button} onPress={signupAction} disabled={isLoading}>
              {
                isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )
              }
            </TouchableOpacity>
            {/* SIGN IN LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
}