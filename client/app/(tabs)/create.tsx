import {View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform} from 'react-native'
import React, { useState, useEffect } from 'react'
import {useRouter, useFocusEffect} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import {useAuthStore} from '../../store/auth.store'
import {useHabitStore} from '../../store/habit.store'
import {CUSTOM_ICONS} from '../../constants/customIcons'
import CustomAlert from '../../constants/CustomAlert'
import SafeScreen from '../../constants/SafeScreen'

export default function Create() {
  const router = useRouter();
  const {token} = useAuthStore();
  const {presets, fetchPresets, createHabit, isLoading: storeLoading, error: storeError} = useHabitStore();
  const [habitType, setHabitType] = useState('default');
  const [selectedHabit, setSelectedHabit] = useState<any>(null) ;
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('heart-outline') 
  const [customUnit, setCustomUnit] = useState('') 
  const [targetAmount, setTargetAmount] = useState('');
  const [incrementAmount, setIncrementAmount] = useState(''); 
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });


  useEffect(() => {
    if (token && presets.length === 0) {
      fetchPresets()
    }
  }, [token, presets.length, fetchPresets])

  useEffect(() => {
    if (habitType === 'default' && selectedHabit) {
      setTargetAmount(selectedHabit.targetAmount.toString())
      setIncrementAmount(selectedHabit.incrementAmount.toString())
      setSelectedUnit(selectedHabit.unit)
    }
  }, [selectedHabit, habitType])

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
    try {
      setIsLoading(true)
      let habitData = {}
      
      if (habitType === 'default') {
        if (!selectedHabit) {
          setShowAlert({
            visible: true,
            title: 'Missing Information',
            message: 'Please select a habit preset.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
          })
          return;
        }
        if (!targetAmount || !incrementAmount || !selectedUnit) {
          setShowAlert({
            visible: true,
            title: 'Missing Information',
            message: 'For preset habits: name, type, category, unit, targetAmount and incrementAmount are required.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
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
            buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
          })
          return
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
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        })
        return;
      }

      if (isNaN(parseInt(incrementAmount)) || parseInt(incrementAmount) <= 0) {
        setShowAlert({
          visible: true,
          title: 'Invalid Input',
          message: 'Increment amount must be a positive number.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
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
          buttons: [{ text: 'OK', onPress: () => { setShowAlert(prev => ({ ...prev, visible: false })); router.push('/(tabs)'); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: 'Habit Creation Failed',
          message: result.message || 'Failed to create habit',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
        })
      }
    } catch (error: any) {
      setShowAlert({
        visible: true,
        title: 'Connection Error',
        message: 'Failed to connect to server. Please check your internet connection and try again.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'default' }]
      })
    } finally {
      setIsLoading(false)
    }
  };

  const renderDefaultHabits = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Choose a Default Habit</Text>
        {
          storeLoading ? (
            <Text style={styles.label}>Loading presets...</Text>
          ) : storeError ? (
            <View>
              {/* ERROR: FAILED TO LOAD PRESETS */}
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
                  <Ionicons 
                    name={(habit.icon || "heart-outline") as any} 
                    size={32} 
                    color={selectedHabit?.name === habit.name ? COLORS.white : COLORS.primary} 
                  />
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
        {
          selectedHabit && (
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
                
              {/* TARGET AMOUNT */}
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
                
              {/* INCREMENT AMOUNT */}
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
  );

  const renderCustomHabit = () => (
    <View>
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
        onDismiss={() => setShowAlert(prev => ({ ...prev, visible: false }))}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER WITH BACK AND CREATE BUTTONS */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 20, 
          paddingVertical: 10
        }}>
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
                  { text: 'Stay', onPress: () => setShowAlert(prev => ({ ...prev, visible: false })), style: 'cancel' },
                  { text: 'Cancel', onPress: () => { setShowAlert(prev => ({ ...prev, visible: false })); router.back(); }, style: 'destructive' }
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
        
        <ScrollView 
          style={styles.scrollViewStyle} 
          contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>Choose a preset habit or create your own</Text>
        </View>
        
        <View style={styles.form}>
          {/* HABIT TYPE SELECTION*/}
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
          
          {habitType === 'default' ? renderDefaultHabits() : renderCustomHabit()}
        </View>

      </View>
      
      <Modal
        visible={showIconModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Icon</Text>
              <TouchableOpacity onPress={() => setShowIconModal(false)}>
                <Ionicons name="close-outline" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
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