import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import { useAuthStore } from '../../store/auth.store'
import { useHabitStore } from '../../store/habit.store'

const CUSTOM_ICONS = [
  "heart-outline", "star-outline", "trophy-outline", "medal-outline",
  "flash-outline", "leaf-outline", "flame-outline", "bulb-outline",
  "musical-notes-outline", "camera-outline", "brush-outline", "game-controller-outline",
  "laptop-outline", "library-outline", "car-outline", "airplane-outline"
];

export default function Create() {
  const router = useRouter()
  const { token } = useAuthStore()
  const { presets, fetchPresets, createHabit, isLoading: storeLoading, error: storeError } = useHabitStore()
  
  const [habitType, setHabitType] = useState('default') // 'default' or 'other'
  const [selectedHabit, setSelectedHabit] = useState<any>(null)
  const [customName, setCustomName] = useState('')
  const [customIcon, setCustomIcon] = useState('heart-outline')
  const [customUnit, setCustomUnit] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [incrementAmount, setIncrementAmount] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [showIconModal, setShowIconModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Presets'i yükle
  useEffect(() => {
    if (token && presets.length === 0) {
      fetchPresets(token)
    }
  }, [token, presets.length, fetchPresets])

  useEffect(() => {
    if (habitType === 'default' && selectedHabit) {
      setTargetAmount(selectedHabit.targetAmount.toString())
      setIncrementAmount(selectedHabit.incrementAmount.toString())
      setSelectedUnit(selectedHabit.unit)
    }
  }, [selectedHabit, habitType])

  const handleCreateHabit = async () => {
    try {
      setIsLoading(true)
      
      let habitData = {}
      
      if (habitType === 'default') {
        if (!selectedHabit || !targetAmount || !incrementAmount || !selectedUnit) {
          Alert.alert('Error', 'Please fill all required fields')
          return
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
        if (!customName || !customUnit || !targetAmount || !incrementAmount) {
          Alert.alert('Error', 'Please fill all required fields')
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

      const result = await createHabit(habitData, token)

      if (result.success) {
        Alert.alert('Success', 'Habit created successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ])
      } else {
        Alert.alert('Error', result.message || 'Failed to create habit')
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
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
            onPress={() => token && fetchPresets(token)}
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </ScrollView>
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
  )

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
  )

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
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginLeft: 8, marginTop: 0 }, isLoading && styles.disabledButton]}
            onPress={handleCreateHabit}
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