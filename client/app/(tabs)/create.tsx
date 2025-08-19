import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import { useAuthStore } from '../../store/auth.store'
import { useHabitStore } from '@/store/habit.store'
import { CUSTOM_ICONS } from '../../constants/customIcons'

export default function Create() {
  const router = useRouter()
  const {token} = useAuthStore()
  const {presets, fetchPresets, createHabit, isLoading: storeLoading, error: storeError} = useHabitStore()
  const [habitType, setHabitType] = useState('default')
  const [selectedHabit, setSelectedHabit] = useState<any>(null)
  const [customName, setCustomName] = useState('')
  const [customIcon, setCustomIcon] = useState('heart-outline')
  const [customUnit, setCustomUnit] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [incrementAmount, setIncrementAmount] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [showIconModal, setShowIconModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const createHabitAction = async () => {
    try {
      setIsLoading(true)
      let habitData = {}
      
      if (habitType === 'default') {
        if (!selectedHabit) {
          Alert.alert('Missing Information', 'Please select a habit preset.')
          return;
        }
        if (!targetAmount || !incrementAmount || !selectedUnit) {
          Alert.alert('Missing Information', 'For preset habits: name, type, category, unit, targetAmount and incrementAmount are required.')
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
          Alert.alert('Missing Information', 'For custom habits: icon, unit, targetAmount and incrementAmount are required.')
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

      // Validation for numeric values
      if (isNaN(parseInt(targetAmount)) || parseInt(targetAmount) <= 0) {
        Alert.alert('Invalid Input', 'Target amount must be a positive number.')
        return;
      }

      if (isNaN(parseInt(incrementAmount)) || parseInt(incrementAmount) <= 0) {
        Alert.alert('Invalid Input', 'Increment amount must be a positive number.')
        return;
      }

      const result = await createHabit(habitData)

      console.log('Create habit result:', result);

      if (result.success) {
        Alert.alert('Success', 'Habit created successfully!', [
          { 
            text: 'OK', 
            onPress: () => router.push('/(tabs)') 
          }
        ]);
      } else {
        // Backend'den gelen hata mesajını doğrudan kullan
        Alert.alert('Habit Creation Failed', result.message || 'Failed to create habit')
      }
    } catch (error: any) {
      console.error('HandleCreateHabit error:', error);
      Alert.alert('Connection Error', 'Failed to connect to server. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderDefaultHabits = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Choose a Default Habit</Text>
      {storeLoading ? (
        <Text style={styles.label}>Loading presets...</Text>
      ) : storeError ? (
        <View>
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
      )}
      
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
        </>
      )}
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
    <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>Choose a preset habit or create your own</Text>
        </View>
        
        <View style={styles.form}>
          {/* Habit Type Selector */}
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
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginRight: 8, marginTop: 0 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginTop: 0 }, isLoading && styles.disabledButton]}
            onPress={createHabitAction}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Icon Selection Modal */}
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
  )
}