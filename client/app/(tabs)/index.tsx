import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import React from 'react';
import {Image} from 'expo-image';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import styles from '../../assets/styles/home.styles';
import {useAuthStore} from '../../store/auth.store';
import {useHabitStore} from '../../store/habit.store';
import SafeScreen from '../../constants/SafeScreen';
import COLORS from '../../constants/colors';

export default function Home() {
  const {user, token} = useAuthStore();
  const {habits, fetchHabits, incrementHabit, isLoading} = useHabitStore();
  const [pressedButton, setPressedButton] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token, fetchHabits]);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12)
      return "Good Morning";
    else if (currentHour >= 12 && currentHour < 18)
      return "Good Afternoon";
    else if (currentHour >= 18 && currentHour < 22)
      return "Good Evening";
    else
      return "Good Night";
  };

  return (
    <SafeScreen>
      <View style={styles.container}>

      {/* FIXED HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: user?.profilePicture || 'https://via.placeholder.com/40' }} 
            style={styles.avatar}
          />
          <View style={{ marginTop: 10 }}>
            <Text style={styles.headerSubtitle}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>{user?.username || 'Guest'}</Text>
          </View>
        </View>
      </View>

      {/* FIXED HABIRT SECTION */}
      <View style={styles.habitHeader}>
        <Text style={styles.habitTitle}>HABITS</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/create')}
        >
          <Ionicons 
            name="menu" 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE HABITS LIST */}
      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {
          isLoading ? (
            <View style={[styles.habitCard, { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : habits.length === 0 ? (
            <View style={styles.habitCard}>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Add a new habit</Text>
                <Text style={styles.emptySubtext}>Start building better routines by adding your first habit</Text>
              </View>
            </View>
          ) : (
            habits.map((habit: any) => {
              const progress = habit.todayProgress?.progress || 0;
              const target = habit.targetAmount || 1;
              const current = Math.round(progress * target);
              const isCompleted = progress >= 1;
              const unit = (habit.unit || '').toUpperCase();
            
              return (
                <View 
                  key={habit.id} 
                  style={[
                    styles.habitCard,
                    isCompleted && styles.habitCardCompleted
                  ]}
                >
                  <View style={styles.habitItem}>
                    <View style={styles.habitInfo}>
                      <View style={styles.habitIconContainer}>
                        <Ionicons 
                          name={habit?.icon || 'checkmark-circle'} 
                          size={16} 
                          color="white" 
                          style={styles.habitIcon}
                        />
                      </View>

                      {/* HABIT NAME */}
                      <View style={styles.habitTextContainer}>
                        <Text style={styles.habitName}>{habit.name}</Text>
                      </View>

                      {/* DETAIL BUTTON */}
                      <TouchableOpacity 
                        style={[
                          styles.habitDetailButton,
                          pressedButton === `detail-${habit.id}` && { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                        ]}
                        onPressIn={() => setPressedButton(`detail-${habit.id}`)}
                        onPressOut={() => setPressedButton(null)}
                        onPress={() => {
                          router.push(`/(tabs)/detail?habitId=${habit.id}`);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.habitDetailButtonText}>⋯</Text>
                      </TouchableOpacity>
                    </View>

                    {/* INCREMENT BUTTON */}
                    <View style={styles.habitActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => token && incrementHabit(habit.id)}
                      >
                        <Text style={styles.actionButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* PROGRESS BAR */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderContainer}>
                      <Text style={isCompleted ? styles.progressTextCompleted : styles.progressText}>
                        {unit}
                      </Text>
                      <Text style={isCompleted ? styles.progressTextCompleted : styles.progressText}>
                        {current}/{target}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          isCompleted ? styles.progressFillCompleted : styles.progressFill, 
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
    </SafeScreen>
  );
}