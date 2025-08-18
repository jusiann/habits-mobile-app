import { useAuthStore } from "@/store/auth.store";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState, ReactNode } from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  
  const { checkAuth, token } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isReady) return;
    
    const inAuthScreen = segments[0] === "(auth)";
    const inTabsScreen = segments[0] === "(tabs)";
    const isAuthenticated = !!token;
    
    console.log("ProtectedRoute:", { 
      isAuthenticated, 
      currentPath: `/${segments.join("/")}`, 
      inTabsScreen, 
      inAuthScreen,
      token: !!token
    });
    
    // Public routes that don't require authentication
    const publicRoutes = ["/", "/(auth)", "/(auth)/signup"];
    const currentPath = `/${segments.join("/")}`;
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
    
    if (!isAuthenticated && (inTabsScreen || !isPublicRoute)) {
      // User not authenticated and trying to access protected route
      // Use replace to ensure user goes to landing page
      console.log("Redirecting to landing page - not authenticated");
      router.replace("/");
    } else if (isAuthenticated && (inAuthScreen || currentPath === "/")) {
      // User authenticated but on auth screen or landing page - redirect to tabs
      console.log("Redirecting to tabs - authenticated");
      router.replace("/(tabs)");
    }
  }, [token, segments, router, isReady]);

  // Show loading while checking authentication
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
