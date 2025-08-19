import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import styles from "../assets/styles/main.styles";

export default function Index() {
  const router = useRouter();

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
          <Text style={styles.titleFirst}>Welcome to</Text>
          <Text style={styles.titleSecond}>Habits App</Text>
          
          <Text style={styles.subtitleSpaced}>
            Track your daily habits and build better routines
          </Text>
        </View>

        {/* Button Section */}
        <View style={styles.formContainer}>
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
        </View>
      </View>
    </View>
  );
};
