import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import homeStyles from '@/assets/styles/home.styles';
import { useAuthStore } from '@/store/auth.store';

export default function Home() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    } else if (currentHour >= 18 && currentHour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView style={homeStyles.listContainer}>
        {/* Header Section */}
        <View style={homeStyles.header}>
          <View style={homeStyles.userInfo}>
            <Image 
              source={{ uri: user?.profilePicture || 'https://via.placeholder.com/40' }} 
              style={homeStyles.avatar}
            />
            <View style={{ marginTop: 10 }}>
              <Text style={homeStyles.headerSubtitle}>{getGreeting()}</Text>
              <Text style={homeStyles.headerTitle}>{user?.username || 'Guest'}</Text>
            </View>
          </View>
        </View>

        {/* Habits Section Header */}
        <View style={homeStyles.habitHeader}>
          <Text style={homeStyles.habitTitle}>HABITS</Text>
          <TouchableOpacity 
            style={homeStyles.addButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Text style={homeStyles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Habits List Card Area */}
        <View style={homeStyles.habitCard}>
          <View style={homeStyles.emptyContainer}>
            <Text style={homeStyles.emptyText}>Add a new habit</Text>
            <Text style={homeStyles.emptySubtext}>Start building better routines by adding your first habit</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}