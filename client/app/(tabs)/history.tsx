import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Ionicons} from '@expo/vector-icons';
import {Image} from 'expo-image';
import SafeScreen from '../../constants/SafeScreen';
import {useHabitStore} from '../../store/habit.store';
import {useAuthStore} from '../../store/auth.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/history.styles';

interface DayData {
  summary: {
    completionRate: number;
    totalHabits: number;
    completedHabits: number;
    inProgressHabits: number;
    notStartedHabits: number;
  };
}

interface Stats {
  currentStreak: number;
  completionRate: number;
  totalCompletedDays: number;
  totalCompleted: number;
}

export default function History() {
  const {getHabitLogsByDate} = useHabitStore();
  const {user} = useAuthStore();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<{[key: number]: DayData}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    completionRate: 0,
    totalCompletedDays: 0,
    totalCompleted: 0
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add empty cells to complete the grid (make it 6 rows of 7 days = 42 cells)
    while (days.length < 42) {
      days.push(null);
    }
    
    return days;
  };

  // Load month data
  const loadMonthData = async (date: Date): Promise<void> => {
    setLoading(true);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const newMonthData: {[key: number]: DayData} = {};
    
    let totalDays = 0;
    let completedDays = 0;
    let currentStreakCount = 0;
    let streakBroken = false;
    
    // Load data for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      try {
        const result = await getHabitLogsByDate(dateStr);
        if (result.success) {
          newMonthData[day] = result.data;
          totalDays++;
          
          if (result.data.summary.completionRate > 0) {
            if (result.data.summary.completedHabits > 0) {
              completedDays++;
              if (!streakBroken) {
                currentStreakCount++;
              }
            } else {
              streakBroken = true;
            }
          }
        }
      } catch (error) {
        console.error('Error loading day data:', error);
      }
    }
    
    setMonthData(newMonthData);
    setStats({
      currentStreak: currentStreakCount,
      completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
      totalCompletedDays: completedDays,
      totalCompleted: completedDays
    });
    setLoading(false);
  };

  // Navigate months
  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Get progress for a day
  const getDayProgress = (day: number): number => {
    const dayData = monthData[day];
    if (!dayData) return 0;
    return dayData.summary.completionRate || 0;
  };

  // Check if date is today
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  useEffect(() => {
    loadMonthData(currentDate);
  }, [currentDate]);

  const days = getDaysInMonth(currentDate);

  return (
    <SafeScreen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: user?.profilePicture || 'https://via.placeholder.com/40' }} 
              style={styles.avatar}
            />
            <View style={{ marginTop: 10 }}>
              <Text style={styles.headerSubtitle}>History</Text>
              <Text style={styles.headerTitle}>{user?.username || 'Guest'}</Text>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="pie-chart" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{stats.totalCompleted}</Text>
            <Text style={styles.statLabel}>Total Completed</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth(1)}
            >
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View style={styles.dayNamesContainer}>
            {dayNames.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{dayName}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (!day) {
                return <View key={index} style={styles.emptyDay} />;
              }
              
              const dayNumber = day.getDate();
              const progress = getDayProgress(dayNumber);
              const today = isToday(day);
              const selected = isSelected(day);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    today && styles.todayCell,
                    selected && styles.selectedCell
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text style={[
                    styles.dayText,
                    today && styles.todayText,
                    selected && styles.selectedText
                  ]}>
                    {dayNumber}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill,
                          { width: `${progress * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Details */}
        {selectedDate && monthData[selectedDate.getDate()] && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateTitle}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            <View style={styles.selectedDateStats}>
              <View style={styles.selectedStat}>
                <Text style={styles.selectedStatNumber}>
                  {monthData[selectedDate.getDate()].summary.completedHabits}
                </Text>
                <Text style={styles.selectedStatLabel}>Completed</Text>
              </View>
              <View style={styles.selectedStat}>
                <Text style={styles.selectedStatNumber}>
                  {monthData[selectedDate.getDate()].summary.inProgressHabits}
                </Text>
                <Text style={styles.selectedStatLabel}>In Progress</Text>
              </View>
              <View style={styles.selectedStat}>
                <Text style={styles.selectedStatNumber}>
                  {Math.round(monthData[selectedDate.getDate()].summary.completionRate * 100)}%
                </Text>
                <Text style={styles.selectedStatLabel}>Rate</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
