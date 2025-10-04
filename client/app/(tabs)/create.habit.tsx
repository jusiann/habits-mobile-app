import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {useRouter, useFocusEffect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/auth.store';
import {useHabitStore} from '../../store/habit.store';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/create.habit.styles';
import {CUSTOM_ICONS} from '../../constants/custom.icons';
import CustomAlert from '../../constants/CustomAlert';
import SafeScreen from '../../constants/SafeScreen';
import {showConnectionError} from '../../constants/alert.utils';
import {translate, translateHabitName, translateUnit} from '../../constants/language.utils';

export default function CreateHabit() {
  const router = useRouter();
  const {token} = useAuthStore();
  const {presets, fetchPresets, createHabit, error: storeError} = useHabitStore();
  const [habitType, setHabitType] = React.useState('default');
  const [selectedHabit, setSelectedHabit] = React.useState<any>(null);
  const [customName, setCustomName] = React.useState('');
  const [customIcon, setCustomIcon] = React.useState('heart-outline');
  const [customUnit, setCustomUnit] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');
  const [incrementAmount, setIncrementAmount] = React.useState('');
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [showIconModal, setShowIconModal] = React.useState(false);
  const [isSaveLoading, setIsSaveLoading] = React.useState(false);
  const [isPresetsLoading, setIsPresetsLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  React.useEffect(() => {
    if (token && presets.length === 0) {
      setIsPresetsLoading(true);
      fetchPresets().finally(() => setIsPresetsLoading(false));
    }
  }, [token, presets.length, fetchPresets]);

  React.useEffect(() => {
    if (habitType === 'default' && selectedHabit) {
      setTargetAmount(selectedHabit.targetAmount.toString())
      setIncrementAmount(selectedHabit.incrementAmount.toString())
      setSelectedUnit(selectedHabit.unit)
    }
  }, [selectedHabit, habitType]);

  useFocusEffect(
    React.useCallback(() => {
      if (habitType === 'default' && selectedHabit) {
        setCustomName('');
        setCustomIcon('heart-outline');
        setCustomUnit('');
      } else {
        setHabitType('default');
        setSelectedHabit(null);
        setCustomName('');
        setCustomIcon('heart-outline');
        setCustomUnit('');
        setTargetAmount('');
        setIncrementAmount('');
        setSelectedUnit('');
      }
      setShowIconModal(false);
      setIsSaveLoading(false);
      setIsPresetsLoading(false);
    }, [])
  );

  const createHabitAction = async () => {
    setIsSaveLoading(true);
    try {
      let habitData = {}
      if (habitType === 'default') {
        if (!selectedHabit) {
          setShowAlert({
            visible: true,
            title: translate('alerts.missingInfo'),
            message: translate('alerts.missingInfo'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
        
        if (!targetAmount || !incrementAmount || !selectedUnit) {
          setShowAlert({
            visible: true,
            title: translate('alerts.missingInfo'),
            message: translate('alerts.missingInfo'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
        
        habitData = {
          name: selectedHabit.name,
          type: 'default',
          category: 'health',
          unit: selectedUnit,
          targetAmount: parseInt(targetAmount),
          incrementAmount: parseInt(incrementAmount)
        }
      } else {
        if (!customName || !customIcon || !customUnit || !targetAmount || !incrementAmount) {
          setShowAlert({
            visible: true,
            title: translate('alerts.missingInfo'),
            message: translate('alerts.missingInfo'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
        
        habitData = {
          name: customName,
          type: 'other',
          category: 'health',
          icon: customIcon,
          unit: customUnit,
          targetAmount: parseInt(targetAmount),
          incrementAmount: parseInt(incrementAmount),
          availableUnits: []
        }
      }

      if (isNaN(parseInt(targetAmount)) || parseInt(targetAmount) <= 0) {
        setShowAlert({
          visible: true,
          title: translate('alerts.invalidInput'),
          message: translate('alerts.targetAmountError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
        return;
      }

      if (isNaN(parseInt(incrementAmount)) || parseInt(incrementAmount) <= 0) {
        setShowAlert({
          visible: true,
          title: translate('alerts.invalidInput'),
          message: translate('alerts.incrementAmountError'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
        return;
      }

      const result = await createHabit(habitData)
      if (result.success) {
        setShowAlert({
          visible: true,
          title: translate('common.success'),
          message: translate('habits.create.successMessage'),
          type: 'success',
          buttons: [{ text: translate('common.ok'), onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: translate('habits.create.failed'),
          message: result.message || translate('habits.create.failedMessage'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        showConnectionError(() => {
          setShowAlert(prev => ({ ...prev, visible: false }));
          setIsSaveLoading(false);
        });
      }
    } finally {
      setIsSaveLoading(false);
    }
  };

  const renderDefaultHabits = () => (
    <View>

      {/* DEFAULT HABIT INFORMATION */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.chooseDefaultTitle')}</Text>
        {
          isPresetsLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : storeError ? (
            <View>

              {/* ERROR MESSAGE AND RETRY BUTTON */}
              <Text style={[styles.label, { color: 'red' }]}>{translate('habits.create.failedToLoad')} {storeError}</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  if (token) {
                    setIsPresetsLoading(true);
                    fetchPresets().finally(() => setIsPresetsLoading(false));
                  }
                }}
              >
                <Text style={styles.buttonText}>{translate('habits.create.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : presets.length === 0 ? (
            <Text style={styles.label}>{translate('habits.create.noPresets')}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 10}}>
              {
                presets.map((habit: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.habitCard,
                      selectedHabit?.name === habit.name && styles.selectedHabitCard
                    ]}
                    onPress={() => setSelectedHabit(habit)}
                  >
    
                    {/* HABIT ICON */}
                    <Ionicons 
                      name={(habit.icon || "heart-outline") as any} 
                      size={32} 
                      color={selectedHabit?.name === habit.name ? COLORS.white : COLORS.primary} 
                    />
    
                    {/* HABIT NAME */}
                    <Text style={[
                      styles.habitCardText,
                      selectedHabit?.name === habit.name && styles.selectedHabitCardText
                    ]}>
                      {translateHabitName(habit)}
                    </Text>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          )
        }
        {
          selectedHabit && (
            <>

              {/* UNIT SELECTOR */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('habits.create.unit')}</Text>
                <View style={styles.unitContainer}>
                  {selectedHabit.availableUnits.map((unit: string) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        selectedUnit === unit && styles.selectedUnitButton
                      ]}
                      onPress={() => setSelectedUnit(unit)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        selectedUnit === unit && styles.selectedUnitButtonText
                      ]}>
                        {translateUnit(unit)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
                
              {/* TARGET AMOUNT INPUT */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('habits.create.targetAmount')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    keyboardType="numeric"
                    placeholder={translate('habits.create.targetAmountPlaceholder')}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
              
              {/* INCREMENT AMOUNT INPUT */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('habits.create.incrementAmount')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={incrementAmount}
                    onChangeText={setIncrementAmount}
                    keyboardType="numeric"
                    placeholder={translate('habits.create.incrementAmountPlaceholder')}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
            </>
        )}
      </View>
    </View>
  );

  const renderCustomHabit = () => (
    <View>
      {/* HABIT NAME INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.habitName')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={setCustomName}
            placeholder={translate('habits.create.habitNamePlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* ICON SELECTOR */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.icon')}</Text>
        <TouchableOpacity 
          style={styles.iconSelector}
          onPress={() => setShowIconModal(true)}
        >
          <Ionicons name={customIcon as any} size={24} color={COLORS.primary} />
          <Text style={styles.iconSelectorText}>{translate('habits.create.iconSelector')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* UNIT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.unit')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={customUnit}
            onChangeText={setCustomUnit}
            placeholder={translate('habits.create.unitPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* TARGET AMOUNT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.targetAmount')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholder={translate('habits.create.targetAmountPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* INCREMENT AMOUNT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('habits.create.incrementAmount')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={incrementAmount}
            onChangeText={setIncrementAmount}
            keyboardType="numeric"
            placeholder={translate('habits.create.incrementAmountPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
    </View>
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
            onPress={() => 
              setShowAlert({
                visible: true,
                title: 'Cancel Habit Creation',
                message: 'Are you sure you want to cancel creating this habit?',
                type: 'warning',
                buttons: [
                  { text: 'Stay', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'cancel' },
                  { text: 'Cancel', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'destructive' }
                ]
              })
            }
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
              {translate('common.cancel')}
            </Text>
          </TouchableOpacity>
          
          {/* CREATE BUTTON */}
          <TouchableOpacity
            style={{
              opacity: isSaveLoading ? 0.5 : 1
            }}
            onPress={createHabitAction}
            disabled={isSaveLoading}
          >
            {isSaveLoading ? (
              <ActivityIndicator size={25} color={COLORS.primary} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.primary
              }}>
                {translate('habits.create.createButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* MAIN CONTENT SCROLL VIEW */}
        <ScrollView 
          style={styles.scrollViewStyle} 
          contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>

            {/* HEADER SECTION */}
            <View style={styles.header}>
              <Text style={styles.title}>{translate('habits.create.title')}</Text>
              <Text style={styles.subtitle}>{translate('habits.create.subtitle')}</Text>
            </View>
            
            {/* FORM SECTION */}
            <View style={styles.form}>

              {/* HABIT TYPE SELECTOR */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('habits.create.habitType')}</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      habitType === 'default' && styles.selectedTypeButton
                    ]}
                    onPress={() => setHabitType('default')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      habitType === 'default' && styles.selectedTypeButtonText
                    ]}>
                      {translate('habits.create.defaultHabit')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      habitType === 'other' && styles.selectedTypeButton
                    ]}
                    onPress={() => setHabitType('other')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      habitType === 'other' && styles.selectedTypeButtonText
                    ]}>
                      {translate('habits.create.customHabit')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* RENDER HABIT FORM BASED ON TYPE */}
              {habitType === 'default' ? renderDefaultHabits() : renderCustomHabit()}
            </View>
          </View>
      
          {/* ICON SELECTION MODAL */}
          <Modal
            visible={showIconModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowIconModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>

                {/* MODAL HEADER */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Icon</Text>
                  <TouchableOpacity onPress={() => setShowIconModal(false)}>
                    <Ionicons name="close-outline" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
                
                {/* ICON GRID */}
                <ScrollView contentContainerStyle={styles.iconGrid}>
                  {CUSTOM_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        customIcon === icon && styles.selectedIconOption
                      ]}
                      onPress={() => {
                        setCustomIcon(icon)
                        setShowIconModal(false)
                      }}
                    >
                      <Ionicons 
                        name={icon as any} 
                        size={32} 
                        color={customIcon === icon ? COLORS.white : COLORS.primary} 
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}