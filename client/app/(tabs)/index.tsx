import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Image} from 'expo-image';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import {useHabitStore} from '../../store/habit.store';
import styles from '../../assets/styles/home.styles';
import COLORS from '../../constants/colors';
import SafeScreen from '../../constants/SafeScreen';
import {getAvatarSource} from '../../constants/avatar.utils';
import {getUserTimezone} from '../../constants/timezone.utils';
import {translate, translateHabitName} from '../../constants/language.utils';

export default function Home() {
  const {user, token, updateProfile} = useAuthStore();
  const {habits, fetchHabits, incrementHabit, habitLogsByDate} = useHabitStore();
  const [pressedButton, setPressedButton] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12)
      return translate('home.greeting.morning');
    else if (currentHour >= 12 && currentHour < 18)
      return translate('home.greeting.afternoon');
    else if (currentHour >= 18 && currentHour < 22)
      return translate('home.greeting.evening');
    else
      return translate('home.greeting.night');
  };

  const loadHistoryData = React.useCallback(async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const loadPromises = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        loadPromises.push(habitLogsByDate(date));
      }

      await Promise.all(loadPromises);
      console.log('History data loaded successfully for the month');
    } catch (error) {
      console.error('Error loading history data:', error);
    }
  }, [habitLogsByDate]);

  React.useEffect(() => {
    if (token) {
      setIsLoading(true);
      console.log('Home: starting fetchHabits()');
      fetchHabits().finally(() => {
        setIsLoading(false);
        console.log('Home: fetchHabits() finished, starting loadHistoryData() in background');
        loadHistoryData().catch(err => console.error('Error loading history data (background):', err));
      });
    }
  }, [token, fetchHabits, loadHistoryData]);

  React.useEffect(() => {
    console.log('Habits after fetch:', habits);
    habits.forEach(habit => {
      console.log(`Habit: ${habit.name}, Progress:`, habit.todayProgress?.progress, 'Target:', habit.targetAmount);
    });
  }, [habits]);

  React.useEffect(() => {

  }, [token, loadHistoryData]);

  React.useEffect(() => {
    if (user && token) {
      const userTimezone = getUserTimezone();
      if (user.timezone !== userTimezone) {
        updateProfile({ timezone: userTimezone });
      }
    }
  }, [user, token, updateProfile]);

  return (
    <SafeScreen>
      <View style={styles.container}>

        {/* FIXED HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={getAvatarSource(user, 'Guest')} 
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
          <Text style={styles.habitTitle}>{translate('home.habitsTitle')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/create.habit')}
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
                  <Text style={styles.emptyText}>{translate('home.emptyState.title')}</Text>
                  <Text style={styles.emptySubtext}>{translate('home.emptyState.subtitle')}</Text>
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

                        {/* HABIT ICON */}
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
                          <Text style={styles.habitName}>{translateHabitName(habit)}</Text>
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
                          onPress={() => {token && incrementHabit(habit.id)
                            console.log(`Habit ${habit.id} incremented`);
                          }}
                        >
                          <Text style={styles.actionButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    
                    </View>

                    {/* PROGRESS BAR */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeaderContainer}>

                        {/* HABIT UNIT */}
                        <Text style={isCompleted ? styles.progressTextCompleted : styles.progressText}>
                          {unit}
                        </Text>

                        {/* HABIT PROGRESS */}
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