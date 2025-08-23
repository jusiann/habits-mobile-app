import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import React from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useHabitStore } from '@/store/habit.store'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SafeScreen from '../../constants/SafeScreen'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/profile.styles'

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { clearStore } = useHabitStore();
  const router = useRouter();

  const logoutAction = async () => {
    try {
      clearStore();
      const result = await logout();
      if (result.success) {
        router.dismissAll();
        router.push('/');
      } else {
        Alert.alert('Error', result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred during logout');
    }
  };

  const navigateToUpdate = () => {
    router.push('/(tabs)/update');
  };

  return (
    <SafeScreen>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        {/* PROFILE CARD */}
        <View style={styles.profileHeader}>
          {/* PROFILE PICTURE */}
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=256' }}
              style={styles.profileImage}
            />
          </View>

          {/* USER INFORMATION */}
          <View style={styles.profileInfo}>
            <Text style={styles.username}>@{user?.username || 'username'}</Text>
            <Text style={styles.fullname}>{user?.fullname || 'User'}</Text>
            <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>

        {/* PROFILE DETAILS */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{user?.gender ? (user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other') : 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{user?.age ? `${user.age} years` : 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
             <View style={styles.detailIcon}>
               <Ionicons name="resize-outline" size={24} color={COLORS.primary} />
             </View>
             <View style={styles.detailContent}>
               <Text style={styles.detailLabel}>Height</Text>
               <Text style={styles.detailValue}>{user?.height ? `${user.height} cm` : 'Not specified'}</Text>
             </View>
           </View>

           <View style={styles.detailRow}>
             <View style={styles.detailIcon}>
               <Ionicons name="fitness-outline" size={24} color={COLORS.primary} />
             </View>
             <View style={styles.detailContent}>
               <Text style={styles.detailLabel}>Weight</Text>
               <Text style={styles.detailValue}>{user?.weight ? `${user.weight} kg` : 'Not specified'}</Text>
             </View>
           </View>
        </View>

        {/* GENERAL SETTINGS */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToUpdate}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={logoutAction}>
             <View style={styles.actionIcon}>
               <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
             </View>
             <Text style={styles.actionText}>Logout</Text>
             <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  )
}