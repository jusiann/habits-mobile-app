import {Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import {useAuthStore } from "../store/auth.store";
import {useHabitStore} from "../store/habit.store";
import {useEffect} from "react";
import styles from "../assets/styles/main.styles";

export default function Index() {
  const {user, token, checkAuth, logout} = useAuthStore();
  const {habits, fetchHabits, incrementHabit} = useHabitStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && token) {
      fetchHabits(token);
      router.push("/(tabs)");
    }
  }, [user, token, router, fetchHabits]);

  const handleIncrementHabit = async (habitId: string) => {
    if (token) {
      const result = await incrementHabit(habitId, token);
      if (!result.success) {
        // Handle error silently or show toast
        console.log('Failed to increment habit:', result.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.card}>
        
        {/* Logo Section */}
        <View style={styles.topIllustration}>
          <Image 
            source={require("../assets/images/react-logo.png")} 
            style={styles.illustrationImage}
          />
        </View>
        
         <View style={styles.header}>
          <Text style={styles.titleFirst}>{user && token ? "Welcome back!" : "Welcome to"}</Text>
          <Text style={styles.titleSecond}>{user && token ? "" : "Habits App"}</Text>
          
          <Text style={styles.subtitleSpaced}>
            {user && token 
              ? "Ready to continue your habit journey? Let's keep building those amazing routines!" 
              : "Track your daily habits and build better routines"
            }
          </Text>
        </View>

        {/* Button Section */}
        <View style={styles.formContainer}>
          {user && token ? (
            <>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => {
                  setTimeout(() => router.push('/(tabs)'), 100);
                }}
              >
                <Text style={styles.buttonText}>Go to Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={logout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => router.push('/(auth)')}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => router.push('/(auth)/signup')}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {/* Habits Card - only show when user is logged in */}
      {user && token && habits.length > 0 && (
        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={styles.habitsHeader}>
            <Text style={styles.habitsTitle}>H Coin : 56</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.habitsSubtitle}>HABITS</Text>
          
          <View style={styles.habitsList}>
            {habits.slice(0, 3).map((habit: any) => (
              <View key={habit.id} style={styles.habitItem}>
                <Text style={styles.habitName}>{habit.name.toUpperCase()}</Text>
                <View style={styles.habitActions}>
                  <TouchableOpacity 
                    style={styles.habitButton}
                    onPress={() => handleIncrementHabit(habit.id)}
                  >
                    <Text style={styles.habitButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.habitMenuButton}>
                    <Text style={styles.habitMenuText}>•••</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
