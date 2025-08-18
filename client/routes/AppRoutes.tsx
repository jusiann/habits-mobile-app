import React from "react";
import {Stack} from "expo-router";

export default function AppRoutes() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Public Routes - */}
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      
      {/* Protected Routes */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
