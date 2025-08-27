import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Ionicons} from '@expo/vector-icons';
import {Image} from 'expo-image';
import SafeScreen from '../../constants/SafeScreen';
import {useHabitStore} from '../../store/habit.store';
import {useAuthStore} from '../../store/auth.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/history.styles';
import {
  MONTH_NAMES,
  DAY_NAMES,
  DEFAULT_STATS,
  CALENDAR_CONFIG,
  DAY_DATA_STRUCTURE,
  STATS_STRUCTURE
} from '../../constants/habit.constant';

export default function History() {
  // HOOKS
  const {habitLogsByDate} = useHabitStore();
  const {user} = useAuthStore();

  // STATES
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<{[key: number]: typeof DAY_DATA_STRUCTURE}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<typeof STATS_STRUCTURE>(DEFAULT_STATS);

  // ACTIONS
  const historyActions = {
    // Get days in month
    getDaysInMonth: (date: Date): (Date | null)[] => {
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
      
      // Add empty cells to complete the grid
      while (days.length < CALENDAR_CONFIG.TOTAL_GRID_DAYS) {
        days.push(null);
      }
      
      return days;
    },

    // Load month data
    loadMonthData: async (date: Date): Promise<void> => {
      try {
        setLoading(true);
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const newMonthData: {[key: number]: typeof DAY_DATA_STRUCTURE} = {};
        
        let totalDays = 0;
        let completedDays = 0;
        let currentStreakCount = 0;
        let streakBroken = false;
        
        // Load data for each day in the month
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          const result = await habitLogsByDate(dateStr);
          console.log('API Response for date ' + dateStr + ':', result);
          
          if (result.success && result.data) {
            console.log('Summary for date ' + dateStr + ':', result.data.summary);
            
            newMonthData[day] = {
              summary: {
                completionRate: result.data.summary?.completionRate || 0,
                totalHabits: result.data.summary?.totalHabits || 0,
                completedHabits: result.data.summary?.completedHabits || 0,
                inProgressHabits: result.data.summary?.inProgressHabits || 0,
                notStartedHabits: result.data.summary?.notStartedHabits || 0
              }
            };
            
            totalDays++;
            if (result.data.summary.totalHabits > 0) {
              if (result.data.summary.completedHabits === result.data.summary.totalHabits) {
                completedDays++;
                if (!streakBroken) currentStreakCount++;
              } else {
                streakBroken = true;
              }
            }
          }
        }
        
        setMonthData(newMonthData);
        setStats({
          currentStreak: currentStreakCount,
          completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
          totalCompletedDays: completedDays,
          totalCompleted: completedDays
        });
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setLoading(false);
      }
    },

    // Get progress for a specific day
    getDayProgress: (day: number): number => {
      const dayData = monthData[day];
      if (!dayData || !dayData.summary.totalHabits) return 0;
      return dayData.summary.completedHabits / dayData.summary.totalHabits;
    }
  };

  // EFFECTS
  useEffect(() => {
    historyActions.loadMonthData(currentDate);
  }, [currentDate]);

  const days = historyActions.getDaysInMonth(currentDate);

  return (
    <SafeScreen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* HEADER */}
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

        {/* STATISTICS */}
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

        {/* CALENDAR */}
        <View style={styles.calendarContainer}>
          {/* MONTH NAVIGATION */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                onPress={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(currentDate.getMonth() - 1);
                  setCurrentDate(newDate);
                }}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(currentDate.getMonth() + 1);
                  setCurrentDate(newDate);
                }}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* DAY NAMES */}
          <View style={styles.dayNamesContainer}>
            {DAY_NAMES.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{dayName}</Text>
              </View>
            ))}
          </View>

          {/* CALENDAR GRID */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (!day) {
                return <View key={index} style={styles.emptyDay} />;
              }
              
              const dayNumber = day.getDate();
              const progress = historyActions.getDayProgress(dayNumber);
              const today = day.toDateString() === new Date().toDateString();
              const selected = day.toDateString() === selectedDate.toDateString();
              
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
                  
                  {/* PROGRESS BAR */}
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

        {/* SELECTED DATE DETAILS */}
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