import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/store/auth.store';
import { useHabitStore } from '@/store/habit.store';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { logout } = useAuthStore();
  const { clearStore } = useHabitStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      clearStore();
      const result = await logout();
      if (result.success) {
        router.dismissAll();
        router.push('/');
      } else {
        Alert.alert('Error', result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred during logout');
    }
  };

  return (
    <View>
      <Text>Profile</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>            
    </View>
  )
}