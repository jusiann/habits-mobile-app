import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import {Image} from 'expo-image';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import {useHabitStore} from '../../store/habit.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/profile.styles';
import CustomAlert from '../../constants/CustomAlert';
import SafeScreen from '../../constants/SafeScreen';
import {getAvatarSource} from '../../constants/avatar.utils';
import {showConnectionError} from '../../constants/alert.utils';

export default function Profile() {
  const {user, logout, isLoading} = useAuthStore();
  const {clearStore} = useHabitStore();
  const router = useRouter();
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const logoutAction = async () => {
    clearStore();
    try {
      const result = await logout();
      if (result.success) {
        setShowAlert({
            visible: true,
            title: 'Success',
            message: 'Logout successful',
            type: 'success',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        router.dismissAll();
        router.push('/');
      } else {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: result.message || 'Logout failed',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        showConnectionError(() => {
          setShowAlert(prev => ({ ...prev, visible: false }));
        });
      }
    }
  };

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
      
      {/* SCROLLABLE CONTENT */}
      {
        isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 90 }}
          >
            {/* PROFILE HEADER SECTION */}
            <View style={styles.profileHeader}>

              {/* PROFILE PICTURE */}
              <View style={styles.profileImageContainer}>
              <Image 
                source={getAvatarSource(user, 'Guest')} 
                style={styles.profileImage}
              />
              </View>
      
              {/* USER INFORMATION */}
              <View style={styles.profileInfo}>

                {/* USERNAME */}
                <Text style={styles.username}>@{user?.username || 'username'}</Text>

                {/* FULL NAME */}
                <Text style={styles.fullname}>{user?.fullname || 'User'}</Text>

                {/* EMAIL */}
                <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>
      
            {/* PERSONAL INFORMATION SECTION */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
          
              {/* GENDER DETAIL */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  {/* PERSON ICON */}
                  <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Gender</Text>
                  <Text style={styles.detailValue}>
                    {user?.gender ? (user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other') : 'Not specified'}
                  </Text>
                </View>
              </View>
      
              {/* AGE DETAIL */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>

                  {/* ICON */}
                  <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>

                  {/* AGE INFO */}
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{user?.age ? `${user.age} years` : 'Not specified'}</Text>
                </View>
              </View>
      
              {/* HEIGHT DETAIL */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>

                  {/* ICON */}
                  <Ionicons name="resize-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>

                  {/* HEIGHT INFO */}
                  <Text style={styles.detailLabel}>Height</Text>
                  <Text style={styles.detailValue}>{user?.height ? `${user.height} cm` : 'Not specified'}</Text>
                </View>
              </View>
      
              {/* WEIGHT DETAIL */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>

                  {/* ICON */}
                  <Ionicons name="fitness-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>

                  {/* WEIGHT INFO */}
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{user?.weight ? `${user.weight} kg` : 'Not specified'}</Text>
                </View>
              </View>
            </View>
      
            {/* SETTINGS SECTION */}
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>General Settings</Text>
          
              {/* EDIT PROFILE BUTTON */}
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/update')}>
                <View style={styles.actionIcon}>
                  
                  {/* SETTINGS ICON */}
                  <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Edit Profile</Text>

                {/* FORWARD ICON */}
                <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
      
              {/* LOGOUT BUTTON */}
              <TouchableOpacity style={styles.actionButton} onPress={logoutAction}>
                <View style={styles.actionIcon}>

                  {/* LOGOUT ICON */}
                  <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Logout</Text>

                {/* FORWARD ICON */}
                <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
            </View>
          </ScrollView>
      )}
    </SafeScreen>
  );
};
