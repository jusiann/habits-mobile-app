import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../store/auth.store";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/passwordpages.styles";
import SafeScreen from "../../constants/SafeScreen";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const { sendResetCode } = useAuthStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendResetCodeAction = async () => {
    try {
      if (!email) {
        Alert.alert(
          "Missing Information",
          "Please enter your email address.",
          [{ text: "OK" }]
        );
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert(
          "Invalid Email",
          "Please enter a valid email address.",
          [{ text: "OK" }]
        );
        return;
      }

      setSendingCode(true);
      const result = await sendResetCode(email);
      
      if (result.success) {
        Alert.alert(
          "Reset Code Sent",
          result.message,
          [{ text: "OK" }]
        );
        setCodeSent(true);
      } else {
        Alert.alert(
          "Error",
          result.message,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Send reset code error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to send reset code. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCodeAction = async () => {
    try {
      if (!resetCode.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter the reset code.",
          [{ text: "OK" }]
        );
        return;
      }

      setVerifyingCode(true);
      const checkResponse = await fetch('https://habits-mobile-app.onrender.com/api/auth/check-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode }),
      });
      
      const checkData = await checkResponse.json();
      
      if (checkResponse.ok && checkData.success) {
        router.push({
          pathname: '/(auth)/changepassword',
          params: { email, resetCode }
        });
      } else {
        Alert.alert(
          "Verification Failed",
          checkData.message || 'Invalid reset code',
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Verify code error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to verify reset code. Please check your internet connection.",
        [{ text: "OK" }]
      );
    } finally {
      setVerifyingCode(false);
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
        
        <View style={styles.card}>
          {/* HEADER */}
          <View style={[styles.header, { marginBottom: 40 }]}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and reset code
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* EMAIL INPUT */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.placeholderText}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {/* SEND RESET CODE BUTTON */}
                  <TouchableOpacity
                    onPress={sendResetCodeAction}
                    disabled={sendingCode}
                    style={{
                      backgroundColor: COLORS.primary,
                      height: 48,
                      width: 48,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {
                      sendingCode ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                          {
                            codeSent ? 
                                <Ionicons name="checkmark" size={24} color="#fff" /> 
                                : <Ionicons name="arrow-forward" size={24} color="#fff" />

                          }
                        </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* RESET CODE INPUT */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reset Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter reset code"
                    placeholderTextColor={COLORS.placeholderText}
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="default"
                  />
                </View>
              </View>
            </View>

            {/* BUTTONS SECTION */}
            <View style={{ marginTop: 30 }}>
              {/* VERIFY CODE BUTTON */}
               <TouchableOpacity
                 style={[styles.button, verifyingCode && styles.buttonDisabled]}
                 onPress={verifyCodeAction}
                 disabled={verifyingCode}
               >
                 {verifyingCode ? (
                   <ActivityIndicator color="#fff" />
                 ) : (
                   <Text style={styles.buttonText}>Verify Code</Text>
                 )}
               </TouchableOpacity>


            </View>


          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};



export default ForgotPassword;