  import SafeScreen from "@/constants/SafeScreen";
  import { StatusBar } from "expo-status-bar";
  import { SafeAreaProvider } from "react-native-safe-area-context";
  import { Stack, SplashScreen } from "expo-router";
  import { useAuthStore } from "@/store/auth.store";
  import { useEffect, useState } from "react";

  // Splash screen controller to manage authentication loading
  function SplashScreenController() {
    const { checkAuth } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const initAuth = async () => {
        await checkAuth();
        setIsReady(true);
      };
      
      initAuth();
    }, [checkAuth]);

    useEffect(() => {
      if (isReady) {
        SplashScreen.hideAsync();
      }
    }, [isReady]);

    return null;
  }

  // Main navigation component with protection
  function RootNavigator() {
    const { token } = useAuthStore();
    const isAuthenticated = !!token;

    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Protected routes - only accessible when authenticated */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Public routes - only accessible when not authenticated */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    );
  }

  export default function RootLayout() {
    return (
      <SafeAreaProvider>
        <SafeScreen>
          <SplashScreenController />
          <RootNavigator />
        </SafeScreen>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

