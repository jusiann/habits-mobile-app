import React from "react";
import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator} from "react-native";
import {Ionicons } from "@expo/vector-icons";
import {router} from "expo-router";
import {useAuthStore} from "../../store/auth.store";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/passwordpages.styles";
import SafeScreen from "../../constants/SafeScreen";
import CustomAlert from "../../constants/CustomAlert";

const ForgotPassword = () => {
  const [email, setEmail] = React.useState("");
  const [resetCode, setResetCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [sendingCode, setSendingCode] = React.useState(false);
  const [verifyingCode, setVerifyingCode] = React.useState(false);
  const {sendResetCode, verifyResetCode} = useAuthStore();
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendResetCodeAction = async () => {
    try {
      if (!email) {
        setShowAlert({
          visible: true,
          title: "Missing Information",
          message: "Please enter your email address.",
          type: "warning",
          buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
        });
        return;
      }

      if (!validateEmail(email)) {
        setShowAlert({
          visible: true,
          title: "Invalid Email",
          message: "Please enter a valid email address.",
          type: "warning",
          buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
        });
        return;
      }

      setSendingCode(true);
      const result = await sendResetCode(email);
      if (result.success) {
        setShowAlert({
          visible: true,
          title: "Reset Code Sent",
          message: result.message,
          type: "success",
          buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
        });
        setCodeSent(true);
      } else {
        setShowAlert({
          visible: true,
          title: "Error",
          message: result.message,
          type: "error",
          buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
        });
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        title: "Connection Error",
        message: "Failed to send reset code. Please check your internet connection and try again.",
        type: "error",
        buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
      });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCodeAction = async () => {
    try {
      if (!resetCode.trim()) {
        setShowAlert({
          visible: true,
          title: "Missing Information",
          message: "Please enter the reset code.",
          type: "warning",
          buttons: [{ text: "OK", onPress: () => setShowAlert(prev => ({ ...prev, visible: false })) }]
        });
        return;
      }

      setVerifyingCode(true);
      const result = await verifyResetCode(email, resetCode);
      
      if (result.success) {
        router.push({
          pathname: '/(auth)/changepassword',
          params: { email, resetCode }
        });
      } else {
        setShowAlert({
          visible: true,
          title: "Verification Failed",
          message: result.message || 'Invalid reset code',
          type: "error",
          buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
        });
      }
    } catch (error) {
      setShowAlert({
        visible: true,
        title: "Connection Error",
        message: "Failed to verify reset code. Please check your internet connection.",
        type: "error",
        buttons: [{ text: "OK", onPress: () => setShowAlert(previous => ({ ...previous, visible: false })) }]
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <SafeScreen>
      <CustomAlert
        visible={showAlert.visible}
        title={showAlert.title}
        message={showAlert.message}
        buttons={showAlert.buttons}
        type={showAlert.type}
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