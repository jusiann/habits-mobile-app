import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CustomAlert from '../../constants/CustomAlert'
import SafeScreen from '../../constants/SafeScreen'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/profile.styles'

export default function UpdateProfile() {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const router = useRouter();

  // Form states
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      setFullname(user.fullname || '');
      setGender(user.gender || '');
      setAge(user.age?.toString() || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const changes = fullname !== (user.fullname || '') ||
                   gender !== (user.gender || '') ||
                   age !== (user.age?.toString() || '') ||
                   height !== (user.height?.toString() || '') ||
                   weight !== (user.weight?.toString() || '') ||
                   profilePicture !== (user.profilePicture || '');
    
    setHasChanges(changes);
  }, [user, fullname, gender, height, weight, profilePicture]);

  const handleUpdateProfile = async () => {
    try {
      if (!fullname.trim()) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'Full name field cannot be empty.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (fullname.trim().length < 2) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'Full name must be at least 2 characters long.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150)) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'Age must be between 0-150 years.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (height && (isNaN(Number(height)) || Number(height) < 0 || Number(height) > 300)) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'Height must be between 0-300 cm.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (weight && (isNaN(Number(weight)) || Number(weight) < 0 || Number(weight) > 500)) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'Weight must be between 0-500 kg.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      const profileData = {
        fullname: fullname.trim(),
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        profilePicture: profilePicture || undefined
      };

      // Remove undefined values
      Object.keys(profileData).forEach(key => {
        if (profileData[key as keyof typeof profileData] === undefined) {
          delete profileData[key as keyof typeof profileData];
        }
      });

      const result = await updateProfile(profileData);

      if (result.success) {
        setShowAlert({
          visible: true,
          title: 'Success',
          message: result.message || 'Profile updated successfully.',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => { setShowAlert(prev => ({ ...prev, visible: false })); router.back(); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: result.message || 'An error occurred while updating profile.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setShowAlert({
        visible: true,
        title: 'Error',
        message: 'An unexpected error occurred.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
      });
    }
  };

  const renderChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'All password fields must be filled.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

     
      if (newPassword !== confirmNewPassword) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'New passwords do not match.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      if (currentPassword === newPassword) {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: 'New password must be different from current password.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        return;
      }

      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        setShowAlert({
          visible: true,
          title: 'Success',
          message: result.message || 'Password changed successfully.',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setShowAlert({
          visible: true,
          title: 'Error',
          message: result.message || 'An error occurred while changing password.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setShowAlert({
        visible: true,
        title: 'Error',
        message: 'An unexpected error occurred.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
      });
    }
  };

  const generateNewProfilePicture = () => {
    const name = fullname || user?.fullname || 'User';
    const newUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256&${Date.now()}`;
    setProfilePicture(newUrl);
  };

  return (
    <SafeScreen>
      <CustomAlert
        visible={showAlert.visible}
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
        buttons={showAlert.buttons}
        onDismiss={() => setShowAlert(prev => ({ ...prev, visible: false }))}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER WITH BACK AND SAVE BUTTONS */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 20, 
          paddingVertical: 10,
          backgroundColor: COLORS.background
        }}>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
            onPress={() => {
              if (hasChanges) {
                setShowAlert({
                  visible: true,
                  title: 'Unsaved Changes',
                  message: 'You have unsaved changes. Are you sure you want to leave?',
                  type: 'warning',
                  buttons: [
                    { text: 'Stay', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'cancel' },
                    { text: 'Leave', onPress: () => { setShowAlert(prev => ({ ...prev, visible: false })); router.push("/(tabs)/profile"); }, style: 'destructive' }
                  ]
                })
              } else {
                router.push("/(tabs)/profile")
              }
            }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              opacity: (!hasChanges || isLoading) ? 0.5 : 1
            }}
            onPress={handleUpdateProfile}
            disabled={!hasChanges || isLoading}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: profilePicture || user?.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=256' }}
              style={styles.profileImage}
            />
          </View>
          <TouchableOpacity style={styles.changePictureButton} onPress={generateNewProfilePicture}>
            <Ionicons name="camera" size={18} color={COLORS.white} />
            <Text style={styles.changePictureText}>Change Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Full Name"
                placeholderTextColor={COLORS.placeholderText}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>

              <TouchableOpacity 
                style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
                onPress={() => setGender(gender === 'male' ? '' : 'male')}
              >
                <Ionicons 
                  name={gender === 'male' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={gender === 'male' ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>Male</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
                onPress={() => setGender(gender === 'female' ? '' : 'female')}
              >
                <Ionicons 
                  name={gender === 'female' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={gender === 'female' ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>Female</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]}
                onPress={() => setGender(gender === 'other' ? '' : 'other')}
              >
                <Ionicons 
                  name={gender === 'other' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={gender === 'other' ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                placeholderTextColor={COLORS.placeholderText}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Height */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="resize-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Height (cm)"
                placeholderTextColor={COLORS.placeholderText}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="fitness-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight (kg)"
                placeholderTextColor={COLORS.placeholderText}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { margin: 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={26} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor={COLORS.placeholderText}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons 
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor={COLORS.placeholderText}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons 
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder="Confirm your new password"
                  placeholderTextColor={COLORS.placeholderText}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Button */}
            <TouchableOpacity 
              style={[{
                height: 48,
                borderRadius: 12,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16,
                width: '100%'
              }, isLoading && styles.modalSaveButtonDisabled]} 
              onPress={renderChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.modalSaveText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  )
};