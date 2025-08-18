import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import homeStyles from '@/assets/styles/home.styles';
import { useAuthStore } from '@/store/auth.store';
import { useHabitStore } from '@/store/habit.store';

export default function Home() {
  const { user, token } = useAuthStore();
  const { habits, fetchHabits, incrementHabit, isLoading } = useHabitStore();

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

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token, fetchHabits]);

  const handleIncrement = async (habitId: string) => {
    if (token) {
      await incrementHabit(habitId);
    }
  };

  return (
    <View style={homeStyles.container}>
      {/* Fixed Header Section */}
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

      {/* Fixed Habits Section Header */}
      <View style={homeStyles.habitHeader}>
        <Text style={homeStyles.habitTitle}>HABITS</Text>
        <TouchableOpacity 
          style={homeStyles.addButton}
          onPress={() => router.push('/(tabs)/create')}
        >
          <Text style={homeStyles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Habits List */}
      <ScrollView style={homeStyles.listContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={homeStyles.habitCard}>
            <Text style={homeStyles.emptyText}>Loading Habits...</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={homeStyles.habitCard}>
            <View style={homeStyles.emptyContainer}>
              <Text style={homeStyles.emptyText}>Add a new habit</Text>
              <Text style={homeStyles.emptySubtext}>Start building better routines by adding your first habit</Text>
            </View>
          </View>
        ) : (
          habits.map((habit: any) => (
            <View key={habit.id} style={homeStyles.habitCard}>
              <View style={homeStyles.habitItem}>
                <View style={homeStyles.habitInfo}>
                  <Text style={homeStyles.habitName}>{habit.name}</Text>
                </View>
                <View style={homeStyles.habitActions}>

                  <TouchableOpacity 
                    style={homeStyles.addButton}
                    onPress={() => handleIncrement(habit.id)}
                  >
                    <Text style={homeStyles.addButtonText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={homeStyles.addButton}>
                    <Text style={homeStyles.addButtonText}>•••</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={homeStyles.progressContainer}>
                <View style={homeStyles.progressBar}>
                  <View 
                    style={[
                      homeStyles.progressFill, 
                      { width: `${(habit.todayProgress?.progress || 0) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}