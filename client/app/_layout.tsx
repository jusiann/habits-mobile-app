import { useAuthStore } from "../store/auth.store";
import SafeScreen from "../constants/SafeScreen";
import {Stack, useRouter, useSegments} from "expo-router";
import {StatusBar} from "expo-status-bar"
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useEffect, useState} from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const {checkAuth, user, token} = useAuthStore();

  useEffect(() => {
    checkAuth().then(() => setIsReady(true));
  }, [checkAuth]);

  useEffect(() => {
    if (!isReady) return;
    
    const inAuthScreen = segments[0] === "(auth)";
    const isSignIn = user && token;
    
    if (!inAuthScreen && !isSignIn)
      router.replace("/");
    else if (inAuthScreen && isSignIn)
      router.replace("/(tabs)");
  }, [user, token, segments, router, isReady]);
   
  return (
    <SafeAreaProvider>
      <SafeScreen> 
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="(auth)"/>     
        <Stack.Screen name="(tabs)"/> 
      </Stack>
      </SafeScreen> 
      <StatusBar style="dark"/> 
    </SafeAreaProvider>
    );
}
