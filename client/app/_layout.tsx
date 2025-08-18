import SafeScreen from "@/constants/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppRoutes from "@/routes/AppRoutes";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <ProtectedRoute>
          <AppRoutes />
        </ProtectedRoute>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

