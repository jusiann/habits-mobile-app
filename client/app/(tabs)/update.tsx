import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {Image} from 'expo-image';
import {useRouter, useFocusEffect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/profile.styles';
import CustomAlert from '../../constants/CustomAlert';
import SafeScreen from '../../constants/SafeScreen';
import {getAvatarSource} from '../../constants/avatar.utils';
import { showConnectionError } from '../../constants/alert.utils';
import { translate, changeLanguage, getCurrentLanguage } from '../../constants/language.utils';

export default function UpdateProfile() {
  const {user, updateProfile, changePassword, isLoading} = useAuthStore();
  const router = useRouter();
  const [fullname, setFullname] = React.useState(user?.fullname || '');
  const [gender, setGender] = React.useState(user?.gender || '');
  const [age, setAge] = React.useState(user?.age?.toString() || '');
  const [height, setHeight] = React.useState(user?.height?.toString() || '');
  const [weight, setWeight] = React.useState(user?.weight?.toString() || '');
  const [profilePicture, setProfilePicture] = React.useState(user?.profilePicture || '01');
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState('');
  const [tempProfilePicture, setTempProfilePicture] = React.useState('');
  const [isAvatarSaving, setIsAvatarSaving] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState('en');
    const generateNewProfilePicture = (avatarNumber) => {
    const formattedNumber = avatarNumber < 10 ? `0${avatarNumber}` : avatarNumber;
    setTempProfilePicture(formattedNumber);
    setSelectedAvatar(`avatar${formattedNumber}`);
  };
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  });

  React.useEffect(() => {
    const loadLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLang(lang);
    };
    loadLanguage();
  }, []);

  React.useEffect(() => {
    const changes = fullname !== (user?.fullname || '') ||
                   gender !== (user?.gender || '') ||
                   age !== (user?.age?.toString() || '') ||
                   height !== (user?.height?.toString() || '') ||
                   weight !== (user?.weight?.toString() || '') ||
                   profilePicture !== (user?.profilePicture || '');
    
    setHasChanges(changes);
  }, [fullname, age, gender, height, weight, profilePicture]);

  React.useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setGender(user.gender || '');
      setAge(user.age?.toString() || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setProfilePicture(user.profilePicture || '01');
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      setFullname(user?.fullname || '');
      setGender(user?.gender || '');
      setAge(user?.age?.toString() || '');
      setHeight(user?.height?.toString() || '');
      setWeight(user?.weight?.toString() || '');
      setProfilePicture(user?.profilePicture || '01');
      setSelectedAvatar('');
      setTempProfilePicture('');
      setIsAvatarSaving(false);
    }, [user])
  );

  const updateProfileAction = async () => {
    try {
      if (!fullname.trim()) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.fullNameError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (fullname.trim().length < 2) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.fullNameLengthError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150)) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.ageError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (height && (isNaN(Number(height)) || Number(height) < 0 || Number(height) > 300)) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.heightError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (weight && (isNaN(Number(weight)) || Number(weight) < 0 || Number(weight) > 500)) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.weightError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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

      // REMOVE UNDEFINED VALUES
      Object.keys(profileData).forEach(key => {
        if (profileData[key as keyof typeof profileData] === undefined) {
          delete profileData[key as keyof typeof profileData];
        }
      });

      const result = await updateProfile(profileData);
      if (result.success) {
        setShowAlert({
          visible: true,
          title: translate('common.success'),
          message: result.message || translate('update.profileUpdateSuccess'),
          type: 'success',
          buttons: [{ text: translate('common.ok'), onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.push("/(tabs)/profile"); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: result.message || translate('common.error'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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

  const renderChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.passwordFieldsRequired'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.passwordMismatch'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      if (currentPassword === newPassword) {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: translate('update.samePassword'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setShowAlert({
          visible: true,
          title: translate('common.success'),
          message: result.message || translate('update.passwordChangeSuccess'),
          type: 'success',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setShowAlert({
          visible: true,
          title: translate('common.error'),
          message: result.message || translate('common.error'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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

  const renderProfilePictureChange = async () => {
    try {
      if (selectedAvatar && tempProfilePicture) {
        setIsAvatarSaving(true);
        try {
          setProfilePicture(tempProfilePicture);
          setShowAvatarModal(false);
          setTempProfilePicture('');
          setSelectedAvatar('');
        } catch (error) {
          if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
            showConnectionError(() => {
              setShowAlert(prev => ({ ...prev, visible: false }));
            });
          }
        } finally {
          setIsAvatarSaving(false);
        }
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        showConnectionError(() => {
          setShowAlert(prev => ({ ...prev, visible: false }));
        });
      }
    }
  };

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { margin: 20 }]}> 

          {/* CHANGE PASSWORD */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{translate('update.changePassword')}</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* CURRENT PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('update.currentPassword')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={translate('update.currentPasswordPlaceholder')}
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

          {/* NEW PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('update.newPassword')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={translate('update.newPasswordPlaceholder')}
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

          {/* CONFIRM NEW PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('update.confirmPassword')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder={translate('update.confirmPasswordPlaceholder')}
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
          
          {/* MODAL BUTTON */}
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
            {
              isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.modalSaveText}>{translate('update.changePassword')}</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );

  const renderAvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { margin: 20 }]}> 

          {/* CHOOSE AVATAR */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{translate('update.chooseAvatar')}</Text>
            <TouchableOpacity onPress={() => {
              setShowAvatarModal(false);
              setTempProfilePicture('');
              setSelectedAvatar('');
            }}>
              <Ionicons name="close" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* AVATAR LIST */}
          <View style={styles.avatarGrid}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.avatarItem}
                onPress={() => generateNewProfilePicture(num)}
              >
                <Image
                  source={getAvatarSource(num < 10 ? `0${num}` : `${num}`, user?.fullname || 'Guest')}
                  style={styles.avatarImage}
                />
                {
                  selectedAvatar === `avatar${num < 10 ? '0' + num : num}` && (
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: COLORS.primary,
                      borderRadius: 60,
                      padding: 4
                    }}>
                      <Ionicons name="checkmark" size={15} color={COLORS.white} />
                    </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* CHANGE PROFILE PICTURE */}
          <TouchableOpacity
            style={[styles.saveButton, !selectedAvatar && styles.saveButtonDisabled]}
            onPress={renderProfilePictureChange}
            disabled={!selectedAvatar}
          >
            {
              isAvatarSaving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{translate('update.chooseAvatar')}</Text>
            )}
          </TouchableOpacity>
        </View>
        
      </View>
    </Modal>
  );

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
      <KeyboardAvoidingView 
        style={{flex:1}}
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >

        {/* HEADER WITH BACK AND SAVE BUTTONS */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 4,
          backgroundColor: COLORS.background
        }}>

          {/* BACK BUTTON */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => {
              if (hasChanges) {
                setShowAlert({
                  visible: true,
                  title: translate('update.unsavedChanges'),
                  message: translate('update.unsavedChangesMessage'),
                  type: 'warning',
                  buttons: [
                    { text: translate('update.stay'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'cancel' },
                    { text: translate('update.leave'), onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.push("/(tabs)/profile"); }, style: 'destructive' }
                  ]
                })
              } else {
                router.push("/(tabs)/profile")
              }
            }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              {translate('update.back')}
            </Text>
          </TouchableOpacity>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={{
              opacity: (!hasChanges || isLoading) ? 0.5 : 1
            }}
            onPress={updateProfileAction}
            disabled={!hasChanges || isLoading}
          >
            {
              isLoading ? (
                <ActivityIndicator size={25} color={COLORS.primary} />
              ) : (
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: COLORS.primary
                }}>
                  {translate('update.save')}
                </Text>
            )}
          </TouchableOpacity>

        </View>

        {/* MAIN CONTENT SCROLL VIEW */}
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 90 }}
        >

          {/* PROFILE PICTURE SECTION */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={getAvatarSource(profilePicture, user?.fullname || 'Guest')} 
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity style={styles.changePictureButton} onPress={() => setShowAvatarModal(true)}>
              <Ionicons name="camera" size={18} color={COLORS.white} />
              <Text style={styles.changePictureText}>{translate('update.changePicture')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>

            {/* FULL NAME INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('update.fullName')}</Text>
              <View style={styles.inputContainer}>

                {/* USER ICON */}
                <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullname}
                  onChangeText={setFullname}
                  placeholder={translate('update.fullName').replace(' *', '')}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            {/* GENDER SELECTION */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('profile.gender.label')}</Text>
              <View style={styles.genderContainer}>

                {/* GENDER OPTIONS */}
                <TouchableOpacity 
                  style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
                  onPress={() => setGender(gender === 'male' ? '' : 'male')}
                >
                  <Ionicons 
                    name={gender === 'male' ? 'radio-button-on' : 'radio-button-off'} 
                    size={24} 
                    color={gender === 'male' ? COLORS.primary : COLORS.textSecondary} 
                  />
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>{translate('profile.gender.male')}</Text>
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
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>{translate('profile.gender.female')}</Text>
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
                  <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>{translate('profile.gender.other')}</Text>
                </TouchableOpacity>

              </View>
            </View>

            {/* AGE INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('update.age')}</Text>
              <View style={styles.inputContainer}>

                {/* ICON */}
                <Ionicons name="calendar-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder={translate('update.age')}
                  placeholderTextColor={COLORS.placeholderText}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* HEIGHT INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('update.height')}</Text>
              <View style={styles.inputContainer}>

                {/* ICON */}
                <Ionicons name="resize-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder={translate('update.height')}
                  placeholderTextColor={COLORS.placeholderText}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* WEIGHT INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translate('update.weight')}</Text>
              <View style={styles.inputContainer}>

                {/* ICON */}
                <Ionicons name="fitness-outline" size={24} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={translate('update.weight')}
                  placeholderTextColor={COLORS.placeholderText}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* ACTIONS SECTION */}
          <View style={styles.actionsCard}>

            {/* CHANGE PASSWORD BUTTON */}
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>{translate('update.changePassword')}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* LANGUAGE CHANGE BUTTON */}
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={async () => {
                const newLang = currentLang === 'en' ? 'tr' : 'en';
                await changeLanguage(newLang);
                setCurrentLang(newLang);
                setShowAlert({
                  visible: true,
                  title: translate('common.success'),
                  message: translate('update.changeLanguage'),
                  type: 'success',
                  buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
                });
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="language-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <Text style={styles.actionText}>{translate('update.language')}</Text>
                <Text style={{
                  fontSize: 16,
                  color: COLORS.textSecondary,
                  marginRight: 8
                }}>
                  {currentLang === 'en' ? 'English' : 'Türkçe'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
        {renderAvatarModal()}
        {renderPasswordModal()}
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}