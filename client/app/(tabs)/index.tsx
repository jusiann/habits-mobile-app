import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import homeStyles from '@/assets/styles/home.styles';
import { useAuthStore } from '@/store/auth.store';
import { useHabitStore } from '@/store/habit.store';

export default function Home() {
  const { user, token } = useAuthStore();
  const { habits, fetchHabits, incrementHabit, isLoading } = useHabitStore();
  const [pressedButton, setPressedButton] = useState<string | null>(null);

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
          <Ionicons 
            name="menu" 
            size={20} 
            color="white" 
          />
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
          habits.map((habit: any) => {
            const progress = habit.todayProgress?.progress || 0;
            const target = habit.targetAmount || 1;
            const current = Math.round(progress * target);
            const isCompleted = progress >= 1;
            const unit = (habit.unit || '').toUpperCase(); // Unit'i uppercase yap
            
            return (
              <View 
                key={habit.id} 
                style={[
                  homeStyles.habitCard,
                  isCompleted && homeStyles.habitCardCompleted
                ]}
              >
                <View style={homeStyles.habitItem}>
                  <View style={homeStyles.habitInfo}>
                    <View style={homeStyles.habitIconContainer}>
                      <Ionicons 
                        name={habit?.icon || 'checkmark-circle'} 
                        size={16} 
                        color="white" 
                        style={homeStyles.habitIcon}
                      />
                    </View>
                    <View style={homeStyles.habitTextContainer}>
                      <Text style={homeStyles.habitName}>{habit.name}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        homeStyles.habitDetailButton,
                        pressedButton === `detail-${habit.id}` && { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                      ]}
                      onPressIn={() => setPressedButton(`detail-${habit.id}`)}
                      onPressOut={() => setPressedButton(null)}
                      onPress={() => {
                        // Detail sayfasına yönlendir
                        router.push(`/(tabs)/detail?habitId=${habit.id}`);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={homeStyles.habitDetailButtonText}>⋯</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={homeStyles.habitActions}>
                    <TouchableOpacity 
                      style={homeStyles.actionButton}
                      onPress={() => token && incrementHabit(habit.id)}
                    >
                      <Text style={homeStyles.actionButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={homeStyles.progressContainer}>
                  <View style={homeStyles.progressHeaderContainer}>
                    <Text style={isCompleted ? homeStyles.progressTextCompleted : homeStyles.progressText}>
                      {unit}
                    </Text>
                    <Text style={isCompleted ? homeStyles.progressTextCompleted : homeStyles.progressText}>
                      {current}/{target}
                    </Text>
                  </View>
                  <View style={homeStyles.progressBar}>
                    <View 
                      style={[
                        isCompleted ? homeStyles.progressFillCompleted : homeStyles.progressFill, 
                        { width: `${Math.min(progress * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}