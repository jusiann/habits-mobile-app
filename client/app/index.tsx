import {Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import {useAuthStore } from "../store/auth.store";
import {useEffect} from "react";
import styles from "../assets/styles/main.styles";

export default function Index() {
  const {user, token, checkAuth, logout} = useAuthStore();
  const router = useRouter();
  // console.log("User:", user);
  // console.log("Token:", token);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && token) {
      router.push("/(tabs)");
    }
  }, [user, token, router]);

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
    </View>
  );
};
