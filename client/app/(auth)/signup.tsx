import {View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native'
import React from 'react'
import createStyles from '../../assets/styles/signup.styles';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../constants/ThemeContext';
import {Link} from 'expo-router';
import {useAuthStore} from '../../store/auth.store';
import CustomAlert from '../../constants/CustomAlert'
import SafeScreen from '../../constants/SafeScreen'
import {showConnectionError} from '../../constants/alert.utils'
import {translate} from '../../constants/language.utils';

export default function Signup() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const {colors: COLORS} = useTheme();
  const styles = createStyles(COLORS);
  const {isLoading, register} = useAuthStore();
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const signupAction = async () => {
    try {
      if (!username || !email || !fullName || !password) {
        setShowAlert({
          visible: true,
          title: translate('alerts.missingInfo'),
          message: translate('alerts.missingInfo'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (!confirmPassword) {
        setShowAlert({
          visible: true,
          title: translate('alerts.missingInfo'),
          message: translate('auth.signUp.confirmPasswordPlaceholder'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (password !== confirmPassword) {
        setShowAlert({
          visible: true,
          title: translate('alerts.passwordMismatch'),
          message: translate('alerts.passwordMismatch'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        setShowAlert({
          visible: true,
          title: translate('alerts.invalidEmail'),
          message: translate('alerts.invalidEmail'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }
      
      const result = await register(email, username, fullName, password);
      if (result.success) {
        setShowAlert({
          visible: true,
          title: translate('alerts.signUpSuccessful'),
          message: translate('alerts.signUpSuccessful'),
          type: 'success',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: translate('alerts.signUpFailed'),
          message: result.message || translate('alerts.signUpFailed'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        showConnectionError(() => {
          setShowAlert(previous => ({ ...previous, visible: false }));
        });
      }
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
        style={{flex:1}}
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.card}>

            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>{translate('auth.signUp.title')}</Text>
              <Text style={styles.subtitle}>{translate('auth.signUp.subtitle')}</Text>
            </View>

            <View style={styles.formContainer}>

              {/* USERNAME */}
              <View style={styles.inputGroup}>
                {/* <Text style={styles.label}>Username</Text> */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="at-outline"
                    size={24}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={translate('auth.signUp.usernamePlaceholder')}
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
                    placeholder={translate('auth.signUp.emailPlaceholder')}
                    placeholderTextColor={COLORS.placeholderText}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
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
                    placeholder={translate('auth.signUp.fullNamePlaceholder')}
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
                    placeholder={translate('auth.signUp.passwordPlaceholder')}
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
                    placeholder={translate('auth.signUp.confirmPasswordPlaceholder')}
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

              {/* REGISTER BUTTON */}
              <TouchableOpacity style={styles.button} onPress={signupAction} disabled={isLoading}>
                {
                  isLoading ? (
                    <ActivityIndicator size={25} color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{translate('auth.signUp.signUpButton')}</Text>
                  )
                }
              </TouchableOpacity>

              {/* SIGNIN LINK */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>{translate('auth.signUp.haveAccount')}</Text>
                <Link href="/" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>{translate('auth.signUp.signInLink')}</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}