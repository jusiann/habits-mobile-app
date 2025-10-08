import React from 'react';
import {ActivityIndicator, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {Link} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import createStyles from '../../assets/styles/signin.styles';
import {useAuthStore} from '../../store/auth.store';
import {useTheme} from '../../constants/ThemeContext';
import SafeScreen from '../../constants/SafeScreen';
import CustomAlert from '../../constants/CustomAlert';
import {showConnectionError} from '../../constants/alert.utils';
import {translate} from '../../constants/language.utils';

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const {isLoading, login} = useAuthStore();
  const {colors: COLORS, logo} = useTheme();
  const styles = createStyles(COLORS);
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const signinAction = async () => {
    try {
      if (!email && !username) {
        setShowAlert({
          visible: true,
          title: translate('alerts.missingInfo'),
          message: translate('auth.signIn.emailOrUsernamePlaceholder'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (!password) {
        setShowAlert({
          visible: true,
          title: translate('alerts.missingInfo'),
          message: translate('auth.signIn.passwordPlaceholder'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      const result = await login(email, username, password);
      if (result.success) {
        setShowAlert({
          visible: true,
          title: translate('alerts.signInSuccessful'),
          message: translate('alerts.signInSuccessful'),
          type: 'success',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: translate('alerts.signInFailed'),
          message: result.message || translate('alerts.signInFailed'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        showConnectionError(() => {
          setShowAlert(prev => ({ ...prev, visible: false }));
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

        {/* PICTURE */}
        <View style={styles.topIllustration}>
          <Image
            source={logo} 
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>

            {/* EMAIL OR USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('auth.signIn.emailOrUsername')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={COLORS.primary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={translate('auth.signIn.emailOrUsernamePlaceholder')}
                  placeholderTextColor={COLORS.placeholderText}
                  value={email || username}
                  onChangeText={text => {
                    if (text.includes("@")) {
                      setEmail(text);
                      setUsername("");
                    } else {
                      setUsername(text);
                      setEmail("");
                    }
                  }}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('auth.signIn.password')}</Text>
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
                  placeholder={translate('auth.signIn.passwordPlaceholder')}
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
              <Text style={styles.footerText}>{translate('auth.signIn.forgotPassword')}</Text>
              <Link href="/(auth)/forgotpassword" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>{translate('auth.signIn.resetPassword')}</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity style={[styles.button, {marginTop: 60}]} onPress={signinAction} disabled={isLoading}>
              {
                isLoading ? (
                  <ActivityIndicator size={25} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{translate('auth.signIn.signInButton')}</Text>
                )
              }
            </TouchableOpacity>

            {/* SIGNUP LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{translate('auth.signIn.noAccount')}</Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>{translate('auth.signIn.signUpLink')}</Text>
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

