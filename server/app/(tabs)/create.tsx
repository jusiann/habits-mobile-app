import {View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform} from 'react-native'
import React from 'react'
import {useRouter, useFocusEffect} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import {useAuthStore} from '../../store/auth.store'
import {useHabitStore} from '../../store/habit.store'
import {CUSTOM_ICONS} from '../../constants/custom.icons'
import CustomAlert from '../../constants/CustomAlert'
import SafeScreen from '../../constants/SafeScreen'

export default function Create() {
  const router = useRouter();
  const {token} = useAuthStore();
  const {presets, fetchPresets, createHabit, isLoading: storeLoading, error: storeError} = useHabitStore();
  const [habitType, setHabitType] = React.useState('default');
  const [selectedHabit, setSelectedHabit] = React.useState<any>(null) ;
  const [customName, setCustomName] = React.useState('');
  const [customIcon, setCustomIcon] = React.useState('heart-outline') 
  const [customUnit, setCustomUnit] = React.useState('') 
  const [targetAmount, setTargetAmount] = React.useState('');
  const [incrementAmount, setIncrementAmount] = React.useState(''); 
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [showIconModal, setShowIconModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });


  React.useEffect(() => {
    if (token && presets.length === 0) {
      fetchPresets()
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
      setHabitType('default');
      setSelectedHabit(null);
      setCustomName('');
      setCustomIcon('heart-outline');
      setCustomUnit('');
      setTargetAmount('');
      setIncrementAmount('');
      setSelectedUnit('');
      setShowIconModal(false);
      setIsLoading(false);
    }, [])
  );

  const createHabitAction = async () => {
    setIsLoading(true)
    try {
      let habitData = {}
      if (habitType === 'default') {
        if (!selectedHabit) {
          setShowAlert({
            visible: true,
            title: 'Missing Information',
            message: 'Please select a habit preset.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
        if (!targetAmount || !incrementAmount || !selectedUnit) {
          setShowAlert({
            visible: true,
            title: 'Missing Information',
            message: 'For preset habits: name, type, category, unit, targetAmount and incrementAmount are required.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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
            title: 'Missing Information',
            message: 'For custom habits: icon, unit, targetAmount and incrementAmount are required.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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
          title: 'Invalid Input',
          message: 'Target amount must be a positive number.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
        return;
      }

      if (isNaN(parseInt(incrementAmount)) || parseInt(incrementAmount) <= 0) {
        setShowAlert({
          visible: true,
          title: 'Invalid Input',
          message: 'Increment amount must be a positive number.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
        return;
      }

      const result = await createHabit(habitData)
      if (result.success) {
        setShowAlert({
          visible: true,
          title: 'Success',
          message: 'Habit created successfully!',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.push('/(tabs)'); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: 'Habit Creation Failed',
          message: result.message || 'Failed to create habit',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
      }
    } catch (error: any) {
      setShowAlert({
        visible: true,
        title: 'Connection Error',
        message: 'Failed to connect to server. Please check your internet connection and try again.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      })
    } finally {
      setIsLoading(false)
    }
  };

  const renderDefaultHabits = () => (
    <View>
      {/* DEFAULT HABIT INFORMATION */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Choose a Default Habit</Text>
          {
            storeLoading ? (
              <Text style={styles.label}>Loading presets...</Text>
            ) : storeError ? (
              <View>
                {/* ERROR MESSAGE AND RETRY BUTTON */}
                <Text style={[styles.label, { color: 'red' }]}>Failed to load presets: {storeError}</Text>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => token && fetchPresets()}
                >
                  <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : presets.length === 0 ? (
              <Text style={styles.label}>No presets available</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 10}}>
                {presets.map((habit: any, index: number) => (

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
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )
          }
          {selectedHabit && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Unit</Text>
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
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                  
                {/* TARGET AMOUNT INPUT */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Target Amount</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={targetAmount}
                      onChangeText={setTargetAmount}
                      keyboardType="numeric"
                      placeholder="Enter target amount"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>
                
                {/* INCREMENT AMOUNT INPUT */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Increment Amount</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={incrementAmount}
                      onChangeText={setIncrementAmount}
                      keyboardType="numeric"
                      placeholder="Enter increment amount"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>
              </>
            )
          }
      </View>
    </View>
  );

  const renderCustomHabit = () => (
    <View>
      {/* HABIT NAME INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Habit Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={setCustomName}
            placeholder="Enter habit name"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* ICON SELECTOR */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Icon</Text>
        <TouchableOpacity 
          style={styles.iconSelector}
          onPress={() => setShowIconModal(true)}
        >
          <Ionicons name={customIcon as any} size={24} color={COLORS.primary} />
          <Text style={styles.iconSelectorText}>Tap to change icon</Text>
        </TouchableOpacity>
      </View>
      
      {/* UNIT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Unit</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={customUnit}
            onChangeText={setCustomUnit}
            placeholder="e.g., minutes, pages, times"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* TARGET AMOUNT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Target Amount</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholder="Enter target amount"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
      
      {/* INCREMENT AMOUNT INPUT */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Increment Amount</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={incrementAmount}
            onChangeText={setIncrementAmount}
            keyboardType="numeric"
            placeholder="Enter increment amount"
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
          paddingVertical: 10
        }}>
          {/* BACK BUTTON */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
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
              name="arrow-back" 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          {/* CREATE BUTTON */}
          <TouchableOpacity
            style={{
              opacity: isLoading ? 0.5 : 1
            }}
            onPress={createHabitAction}
            disabled={isLoading}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.primary
            }}>
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
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
              <Text style={styles.title}>Create New Habit</Text>
              <Text style={styles.subtitle}>Choose a preset habit or create your own</Text>
            </View>
            
            {/* FORM SECTION */}
            <View style={styles.form}>

              {/* HABIT TYPE SELECTOR */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Habit Type</Text>
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
                      Default
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
                      Custom
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
};