import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {Stack, SplashScreen} from 'expo-router';
import {useAuthStore} from '../store/auth.store';
import SafeScreen from '../constants/SafeScreen';
import {initializeLanguage} from '../constants/language.utils';
import {ThemeProvider} from '../constants/ThemeContext';
 
function SplashScreenController() {
  const {checkAuth} = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      await initializeLanguage();
      await checkAuth();
      setIsReady(true);
    };
      initAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    if (isReady) {
       SplashScreen.hideAsync();
    }
  }, [isReady]);
    return null;
  }

  function RootNavigator() {
    const {token, forceUpdate} = useAuthStore();
    const authenticated = !!token;

    return (
      <Stack key={forceUpdate} screenOptions={{ headerShown: false }}>
        {/* PROTECTED ROUTES - ONLY ACCESSIBLE WHEN AUTHENTICATED */}
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* PUBLIC ROUTES - ONLY ACCESSIBLE WHEN NOT AUTHENTICATED */}
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    );
  }

  export default function RootLayout() {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <SafeScreen>
            <SplashScreenController />
            <RootNavigator />
          </SafeScreen>
        </ThemeProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

