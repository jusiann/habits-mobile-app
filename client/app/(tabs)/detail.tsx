import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import { useHabitStore } from '@/store/habit.store'
import { CUSTOM_ICONS } from '../../constants/customIcons'

export default function Detail() {
  const router = useRouter()
  const { habitId } = useLocalSearchParams()
  const { habits, updateHabit } = useHabitStore()
  
  const [habit, setHabit] = useState<any>(null)
  const [originalUnit, setOriginalUnit] = useState('')
  const [customName, setCustomName] = useState('')
  const [customIcon, setCustomIcon] = useState('heart-outline')
  const [customUnit, setCustomUnit] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [incrementAmount, setIncrementAmount] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [showIconModal, setShowIconModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Habit'i bul ve state'leri doldur
  useEffect(() => {
    if (habitId && habits.length > 0) {
      const foundHabit = habits.find((h: any) => h.id === habitId)
      if (foundHabit) {
        setHabit(foundHabit)
        setOriginalUnit(foundHabit.unit)
        setTargetAmount(foundHabit.targetAmount.toString())
        setIncrementAmount(foundHabit.incrementAmount.toString())
        setSelectedUnit(foundHabit.unit)
        
        if (foundHabit.type === 'other') {
          setCustomName(foundHabit.name)
          setCustomIcon(foundHabit.icon)
          setCustomUnit(foundHabit.unit)
        }
      }
    }
  }, [habitId, habits])

  // Değişiklikleri takip et
  useEffect(() => {
    if (!habit) return
    
    let changes = false
    
    if (habit.type === 'default') {
      changes = selectedUnit !== habit.unit ||
                targetAmount !== habit.targetAmount.toString() ||
                incrementAmount !== habit.incrementAmount.toString()
    } else {
      changes = customName !== habit.name ||
                customIcon !== habit.icon ||
                customUnit !== habit.unit ||
                targetAmount !== habit.targetAmount.toString() ||
                incrementAmount !== habit.incrementAmount.toString()
    }
    
    setHasChanges(changes)
  }, [habit, customName, customIcon, customUnit, targetAmount, incrementAmount, selectedUnit])

  const updateHabitAction = async () => {
    if (!habit || !hasChanges) return

    try {
      setIsLoading(true)
      let updateData = {}
      
      if (habit.type === 'default') {
        updateData = {
          unit: selectedUnit,
          targetAmount: parseInt(targetAmount),
          incrementAmount: parseInt(incrementAmount)
        }
      } else {
        updateData = {
          name: customName,
          icon: customIcon,
          unit: customUnit,
          targetAmount: parseInt(targetAmount),
          incrementAmount: parseInt(incrementAmount)
        }
      }

      // Validation
      if (isNaN(parseInt(targetAmount)) || parseInt(targetAmount) <= 0) {
        Alert.alert('Invalid Input', 'Target amount must be a positive number.')
        return;
      }

      if (isNaN(parseInt(incrementAmount)) || parseInt(incrementAmount) <= 0) {
        Alert.alert('Invalid Input', 'Increment amount must be a positive number.')
        return;
      }

      if (habit.type === 'other') {
        if (!customName.trim()) {
          Alert.alert('Invalid Input', 'Habit name is required.')
          return;
        }
        if (!customUnit.trim()) {
          Alert.alert('Invalid Input', 'Unit is required.')
          return;
        }
      }

      const result = await updateHabit(habit.id, updateData)

      if (result.success) {
        Alert.alert('Success', 'Habit updated successfully!', [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]);
      } else {
        Alert.alert('Update Failed', result.message || 'Failed to update habit')
      }
    } catch (error: any) {
      console.error('UpdateHabit error:', error);
      Alert.alert('Connection Error', 'Failed to connect to server. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', onPress: () => router.back() }
        ]
      )
    } else {
      router.back()
    }
  }

  if (!habit) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Habit not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderDefaultHabitEdit = () => (
    <View>
      {/* Habit bilgisi - değiştirilemez */}
      <View style={styles.formGroup}>
        <View style={[styles.habitCard, styles.selectedHabitCard, { marginVertical: 10, alignSelf: 'center' }]}>
          <Ionicons 
            name={habit.icon as any} 
            size={32} 
            color={COLORS.white} 
          />
          <Text style={[styles.habitCardText, styles.selectedHabitCardText]}>
            {habit.name}
          </Text>
        </View>
      </View>

      {/* Unit seçimi - sadece mevcut unitler */}
      {habit.availableUnits && habit.availableUnits.length > 0 && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitContainer}>
            {habit.availableUnits.map((unit: string) => (
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
      )}
      
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

      {/* Genel uyarı mesajı */}
      {(selectedUnit !== originalUnit || 
        targetAmount !== habit.targetAmount.toString() || 
        incrementAmount !== habit.incrementAmount.toString()) && (
        <View style={[styles.formGroup, { marginTop: 10 }]}>
          <Text style={[styles.label, { color: 'orange', fontSize: 12, textAlign: 'center' }]}>
            ⚠️ These changes will reset your progress for today
          </Text>
        </View>
      )}
    </View>
  );

  const renderCustomHabitEdit = () => (
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

      {/* Genel uyarı mesajı - sadece progress'i etkileyen değişiklikler için */}
      {(customUnit !== habit.unit || 
        targetAmount !== habit.targetAmount.toString() || 
        incrementAmount !== habit.incrementAmount.toString()) && (
        <View style={[styles.formGroup, { marginTop: 10 }]}>
          <Text style={[styles.label, { color: 'orange', fontSize: 12, textAlign: 'center' }]}>
            ⚠️ These changes will reset your progress for today
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Habit</Text>
          <Text style={styles.subtitle}>
            {habit.type === 'default' 
              ? 'Edit settings for your preset habit' 
              : 'Edit your custom habit'
            }
          </Text>
        </View>
        
        <View style={styles.form}>
          {habit.type === 'default' ? renderDefaultHabitEdit() : renderCustomHabitEdit()}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginRight: 8, marginTop: 0 }]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              { flex: 1, marginTop: 0 }, 
              (!hasChanges || isLoading) && styles.disabledButton
            ]}
            onPress={updateHabitAction}
            disabled={!hasChanges || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
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