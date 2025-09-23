import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {useHabitStore} from '../../store/habit.store';
import {useAuthStore} from '../../store/auth.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/history.styles';
import SafeScreen from '../../constants/SafeScreen';
import {getAvatarSource} from '../../constants/avatar.utils';
import {
  DEFAULT_STATS,
  CALENDAR_CONFIG,
  DAY_DATA_STRUCTURE,
  STATS_STRUCTURE
} from '../../constants/habit.constant';
import { showConnectionError } from '../../constants/alert.utils';
import {translate} from '../../constants/language.utils';

export default function History() {
  const {loadMonthData: loadMonthDataFromStore} = useHabitStore();
  const {user} = useAuthStore();
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [monthData, setMonthData] = React.useState<{[key: number]: typeof DAY_DATA_STRUCTURE}>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [stats, setStats] = React.useState<typeof STATS_STRUCTURE>(DEFAULT_STATS); 
  const [days, setDays] = React.useState<(Date | null)[]>([]);
  const [actions, setActions] = React.useState<any>(null);
  
  const historyAction = React.useCallback(async () => {  
    try {
      // GETTING MONTH'S DAYS
      const getDaysInMonth = (date: Date): (Date | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];
        
        for (let i = 0; i < startingDayOfWeek; i++)
          days.push(null);
        

        for (let day = 1; day <= daysInMonth; day++)
          days.push(new Date(year, month, day));
        
        
        while (days.length < CALENDAR_CONFIG.TOTAL_GRID_DAYS)
          days.push(null);
        
        return days;
      };

      // LOAD THIS MONTH'S DATA
      const loadMonthData = async (date: Date): Promise<void> => {
        try {
          setLoading(true);
          const result = await loadMonthDataFromStore(date); // Use store's loadMonthData
          if (result.success) {
            setMonthData(result.data.monthData);
            setStats(result.data.stats);
          }
        } catch (error) {
          if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
            showConnectionError(() => {});
          }
        } finally {
          setLoading(false);
        }
      };

      return Promise.resolve({
        getDaysInMonth,
        loadMonthData
      });
    } catch (error) {
      console.error('Error in historyAction:', error);
      throw error;
    }
  }, [loadMonthDataFromStore]);

  React.useEffect(() => {
    const initActions = async () => {
      const result = await historyAction();
      setActions(result);
    };
    initActions();
  }, [historyAction]);

  React.useEffect(() => {
    if (!actions) 
      return;

    const loadHistoryData = async () => {
      try {
        setLoading(true);
        await actions.loadMonthData(currentDate);
        const daysInMonth = actions.getDaysInMonth(currentDate);
        setDays(daysInMonth);
      } catch (error) {
        console.error('Error loading history data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistoryData();
    const navigationListener = navigation.addListener('focus', loadHistoryData);
    return () => navigationListener();
  }, [navigation, currentDate, actions]);

  return (
    <SafeScreen>
      {
        loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Image 
                source={getAvatarSource(user, 'Guest')} 
                style={styles.avatar}
              />
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.headerSubtitle}>{translate('history.title')}</Text>
                  <Text style={styles.headerTitle}>{user?.username || 'Guest'}</Text>
                </View>
              </View>
            </View>

            {/* SELECTED DATE DETAILS */}
            {
              selectedDate && monthData[selectedDate.getDate()] && (
                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateTitle}>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                            
                  <View style={[styles.selectedDateStats, { flexDirection: 'row', width: '100%', paddingHorizontal: 12, gap: 8 }]}>
                    <View style={[styles.selectedStat, { 
                      width: '30%',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      elevation: 4
                    }]}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={{ marginBottom: 4 }} />
                      <Text style={[styles.selectedStatNumber, { color: COLORS.primary, fontSize: 20 }]}>
                        {monthData[selectedDate.getDate()].summary.completedHabits}
                      </Text>
                    </View>
                
                  <View style={[styles.selectedStat, { 
                    width: '30%',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4
                  }]}>
                    <Ionicons name="time" size={24} color={COLORS.primary} style={{ marginBottom: 4 }} />
                    <Text style={[styles.selectedStatNumber, { color: COLORS.primary, fontSize: 20 }]}>
                      {monthData[selectedDate.getDate()].summary.inProgressHabits}
                    </Text>
                  </View>
                
                  <View style={[styles.selectedStat, { 
                    width: '30%',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4
                  }]}>
                    <Ionicons name="pie-chart" size={24} color={COLORS.primary} style={{ marginBottom: 4 }} />
                    <Text style={[styles.selectedStatNumber, { color: COLORS.primary, fontSize: 20 }]}>
                      {Math.round(monthData[selectedDate.getDate()].summary.completionRate)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* CALENDAR */}
            <View style={styles.calendarContainer}>

            {/* MONTH NAVIGATION */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {(() => {
                  const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 
                                   'july', 'august', 'september', 'october', 'november', 'december'];
                  return translate(`history.months.${monthKeys[currentDate.getMonth()]}`);
                })()} {currentDate.getFullYear()}
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
              {(() => {
                const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                return dayKeys.map((dayKey) => (
                  <View key={dayKey} style={styles.dayNameCell}>
                    <Text style={styles.dayNameText}>{translate(`history.days.${dayKey}`)}</Text>
                  </View>
                ));
              })()}
            </View>

            {/* CALENDAR GRID */}
            <View style={styles.calendarGrid}>
              {
                days.map((day, index) => {
                  if (!day) {
                    return <View key={index} style={styles.emptyDay} />;
                  }
                
                  const dayNumber = day.getDate();
                  const today = day.toDateString() === new Date().toDateString();
                  const selected = day.toDateString() === selectedDate.toDateString();
                  const progress = monthData[dayNumber]?.summary?.completionRate || 0;
                
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
                              { width: `${progress}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
          </View>

          {/* STATISTICS */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>{translate('history.stats.currentStreak')}</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="pie-chart" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>{translate('history.stats.completionRate')}</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{stats.totalCompleted}</Text>
              <Text style={styles.statLabel}>{translate('history.stats.totalCompleted')}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
}