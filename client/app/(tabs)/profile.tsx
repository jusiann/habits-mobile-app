import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'expo-router';

export default function Profile() {
  const {logout} = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.dismissAll(); 
    setTimeout(() => router.replace('/'), 100);
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