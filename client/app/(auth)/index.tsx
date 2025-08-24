import React from "react";
import {ActivityIndicator, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import {Link, router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import styles from "../../assets/styles/signin.styles";
import COLORS from "../../constants/colors";
import {useAuthStore} from "../../store/auth.store";
import SafeScreen from "../../constants/SafeScreen";
import CustomAlert from "../../constants/CustomAlert";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const { isLoading, login } = useAuthStore();
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

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
    try {
      if (!email && !username) {
        setShowAlert({
          visible: true,
          title: 'Missing Information',
          message: 'Please enter your email or username.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (!password) {
        setShowAlert({
          visible: true,
          title: 'Missing Information',
          message: 'Please enter your password.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      const result = await login(email, username, password);

      if (!result.success) {
        setShowAlert({
          visible: true,
          title: 'Sign In Failed',
          message: result.message || 'Login failed',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      setShowAlert({
        visible: true,
        title: 'Sign In Successful',
        message: 'You have successfully signed in.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
      });

    } catch (error: any) {
      console.error("Login error:", error);
      setShowAlert({
        visible: true,
        title: 'Connection Error',
        message: 'Failed to connect to server. Please check your internet connection and try again.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
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
        onDismiss={() => setShowAlert(prev => ({ ...prev, visible: false }))}
      />
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
            
            {/* FORGOT PASSWORD */}
            <View style={[styles.footer, { marginTop: 0 }]}>
              <Text style={styles.footerText}>Forgot your password?</Text>
              <Link href="/(auth)/forgotpassword" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Reset Password</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {/* LOGIN BUTTON */}
            <TouchableOpacity style={[styles.button, {marginTop: 60}]} onPress={signinAction} disabled={isLoading}>
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
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

