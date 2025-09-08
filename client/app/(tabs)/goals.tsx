import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Image} from 'expo-image';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import {useHabitStore} from '../../store/habit.store';
import SafeScreen from '../../constants/SafeScreen';
import CustomAlert from '../../constants/CustomAlert';
import {getAvatarSource} from '../../constants/avatar.utils';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/goals.styles';

export default function Goals() {
  const {user, token} = useAuthStore();
  const {goals, fetchGoals, deleteGoal, loadMonthData, monthlyCache} = useHabitStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [monthStats, setMonthStats] = React.useState(null);
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  });

  const goalsAction = React.useCallback(async (action: string, goal: any) => {
    try {
      if (action === 'delete') {
        setShowAlert({
          visible: true,
          title: 'Delete Goal',
          message: 'Are you sure you want to delete this goal? This action cannot be undone.',
          type: 'warning',
          buttons: [
            {
              text: 'Cancel',
              onPress: () => setShowAlert(previous => ({ ...previous, visible: false })),
              style: 'cancel'
            },
            {
              text: 'Delete',
              onPress: async () => {
                setShowAlert(previous => ({ ...previous, visible: false }));
                setIsLoading(true);
                try {
                  const res = await deleteGoal(goal.id);
                  if (!res.success) {
                    setShowAlert({
                      visible: true,
                      title: 'Delete Failed',
                      message: res.message || 'Failed to delete goal. Please try again.',
                      type: 'error',
                      buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
                    });
                  } else {
                    await fetchGoals();
                  }
                } catch (err) {
                  console.error('[Goals] delete failed', err);
                  setShowAlert({
                    visible: true,
                    title: 'Delete Failed',
                    message: 'Failed to delete goal. Please try again.',
                    type: 'error',
                    buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
                  });
                } finally {
                  setIsLoading(false);
                }
              },
              style: 'destructive'
            }
          ]
        });
        return;
      }
    } catch (err) {
      console.error('[Goals] action failed', action, err);
    }
  }, [deleteGoal, fetchGoals]);

  const loadHistoryData = React.useCallback(async () => {
    try {
      const today = new Date();
      const result = await loadMonthData(today);
      
      if (result.success) {
        setMonthStats(result.data.stats);
        console.log('Goals: Month stats loaded:', result.data.stats);
        console.log('Goals: Full result:', result);
      } else {
        console.error('Goals: Failed to load month data:', result.message);
      }
    } catch (err) {
      console.error('[Goals] loadHistoryData failed', err);
    }
  }, [loadMonthData]);

  React.useEffect(() => {
    if (token) {
      setIsLoading(true);
      console.log('Goals: starting fetchGoals()');
      fetchGoals().finally(() => {
        setIsLoading(false);
        console.log('Goals: fetchGoals() finished, starting loadHistoryData() in background');
        loadHistoryData().catch(err => console.error('Failed to preload month data for goals', err));
      });
    }
  }, [token, fetchGoals, loadHistoryData]);

  React.useEffect(() => {
    console.log('Goals loaded:', goals);
    console.log('Monthly cache:', monthlyCache);
    console.log('Month stats:', monthStats);
  }, [goals, monthlyCache, monthStats]);

  return (
    <SafeScreen>
      <CustomAlert
        visible={showAlert.visible}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        buttons={showAlert.buttons}
        onDismiss={() => setShowAlert(previous => ({ ...previous, visible: false }))}
      />

      {
        isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.container}>

            {/* HEADER SECTION */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Image
                  source={getAvatarSource(user, 'Guest')}
                  style={styles.avatar}
                />
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.headerSubtitle}>Goals</Text>
                  <Text style={styles.headerTitle}>{user?.username || 'Guest'}</Text>
                </View>
              </View>
            </View>

            {/* GOALS HEADER */}
            <View style={styles.habitHeader}>
              <Text style={styles.habitTitle}>GOALS</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/create.goal')}
              >
                <Ionicons
                  name="menu"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* GOALS LIST */}
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              {
                goals.length === 0 ? (
                  /* EMPTY STATE */
                  <View style={styles.habitCard}>
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No goals yet</Text>
                      <Text style={styles.emptySubtext}>Tap + to create a goal and track progress</Text>
                    </View>
                  </View>
                ) : (
                  /* GOALS MAPPING */
                  goals.map((g: any) => {
                    // Calculate progress from monthly history data
                    const today = new Date();
                    const cacheKey = `${today.getFullYear()}-${today.getMonth()}`;
                    const monthData = monthlyCache[cacheKey] || {};
                    
                    let progress = 0;

                    if (g.type === 'complete') {
                      // Count how many days the specific habit was completed this month
                      let completedDays = 0;
                      const target = Number(g.repeat) || 1;
                      const goalHabitId = g.habitId || g.habit?.id;
                      
                      Object.entries(monthData).forEach(([day, dayData]: [string, any]) => {
                        if (dayData?.data?.habits) {
                          const habitFound = dayData.data.habits.find((h: any) => {
                            return h.habit?.id === goalHabitId && h.completed;
                          });
                          if (habitFound) {
                            completedDays++;
                          }
                        }
                      });
                      
                      progress = target > 0 ? Math.min(completedDays / target, 1) : 0;
                    } else if (g.type === 'reach') {
                      // For reach goals, use history stats based on metric type
                      const target = Number(g.value) || 1;
                      
                      if (g.metric === 'rate') {
                        // For rate: use overall completion rate from monthStats
                        const currentRate = monthStats?.completionRate || 0;
                        progress = target > 0 ? Math.min(currentRate / target, 1) : 0;
                        console.log(`Goal ${g.id} (reach rate): currentRate=${currentRate}, target=${target}, progress=${progress}`);
                        
                      } else if (g.metric === 'streak') {
                        // For streak: use current streak from monthStats
                        const currentStreak = monthStats?.currentStreak || 0;
                        progress = target > 0 ? Math.min(currentStreak / target, 1) : 0;
                        console.log(`Goal ${g.id} (reach streak): currentStreak=${currentStreak}, target=${target}, progress=${progress}`);
                      }
                    } else if (g.type === 'maintain') {
                      // For maintain goals, use overall completion rate from monthStats
                      const currentRate = monthStats?.completionRate || 0;
                      progress = currentRate / 100; // Convert percentage to decimal
                      console.log(`Goal ${g.id} (maintain): currentRate=${currentRate}, progress=${progress}`);
                    }

                    const isCompleted = progress >= 1;
                    let percent = Math.min(Math.round(progress * 100), 100);

                    return (
                      /* GOAL CARD */
                      <View
                        key={g.id}
                        style={[
                          styles.habitCard,
                          isCompleted && styles.habitCardCompleted
                        ]}
                      >
                        <View style={styles.habitItem}>
                          <View style={styles.habitInfo}>

                            {/* PROGRESS PERCENTAGE */}
                            <View style={styles.habitIconContainer}>
                              <Text style={{
                                color: 'white',
                                fontSize: 12,
                                fontWeight: '600'
                              }}>
                                {percent}%
                              </Text>
                            </View>

                            {/* GOAL TITLE */}
                            <View style={styles.habitTextContainer}>
                              <Text style={styles.habitName}>
                                {g.type === 'complete' 
                                  ? `Complete ${g.repeat} ${g.habit?.name || 'habit(s)'}` 
                                  : g.type === 'reach' 
                                  ? `Reach ${g.value} ${g.metric || ''}` 
                                  : g.title || (g.habit?.name || 'Maintain goal')
                                }
                              </Text>
                            </View>

                            {/* DELETE BUTTON */}
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => goalsAction('delete', g)}
                            >
                              <Ionicons name="trash" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* PROGRESS BAR */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View style={[
                              isCompleted ? styles.progressFillCompleted : styles.progressFill, 
                              { width: `${percent}%` }
                            ]} />
                          </View>
                        </View>
                        
                      </View>
                    );
                  })
                )}
            </ScrollView>
          </View>
        )}
    </SafeScreen>
  );
}