import React from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../assets/styles/signin.styles";
import COLORS from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const {isLoading, login} = useAuthStore();

  // Email format validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Input handler with validation
  const handleEmailUsernameChange = (text: string) => {
    if (text.includes("@")) {
      setEmail(text);
      setUsername("");
    } else {
      setUsername(text);
      setEmail("");
    }
  };

  const signinAction = async () => {
    // Form validation
    if (!email && !username) {
      Alert.alert(
        "Missing Information",
        "Please enter your email or username.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Missing Information", 
        "Please enter your password.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await login(username, email, password);
      
      if (!result.success) {
        // Backend'den gelen hata mesajını doğrudan kullan
        Alert.alert(
          "Sign In Failed",
          result.message || "Login failed",
          [{ text: "OK" }]
        );
        return;
      }

      // Başarılı giriş - alert göstermeden direkt yönlendir
      // Router otomatik olarak yönlendirecek
      
    } catch (error: any) {
      console.error("Login error:", error);
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
        <View style={styles.topIllustration}>
          {/* PICTURE */}
          <Image
            source={require("../../assets/images/react-logo.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* EMAIL OR USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={COLORS.primary} 
                  style={styles.inputIcon}
                  />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email or username"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email || username}
                  onChangeText={handleEmailUsernameChange}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
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
                  placeholder="Enter your password"
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
            {/* LOGIN BUTTON */}
            <TouchableOpacity style={styles.button} onPress={signinAction} disabled={isLoading}>
              {
                isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )
              }
            </TouchableOpacity>
            {/* SIGN UP LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account ?</Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

