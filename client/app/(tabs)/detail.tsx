import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import { useHabitStore } from '../../store/habit.store'
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

  useEffect(() => {
    if (!habit) 
      return;
    
    let changes = false
    
    if (habit.type === 'default')
      changes = selectedUnit !== habit.unit ||
                targetAmount !== habit.targetAmount.toString() ||
                incrementAmount !== habit.incrementAmount.toString()
    else
      changes = customName !== habit.name ||
                customIcon !== habit.icon ||
                customUnit !== habit.unit ||
                targetAmount !== habit.targetAmount.toString() ||
                incrementAmount !== habit.incrementAmount.toString()
    setHasChanges(changes)
  }, [habit, customName, customIcon, customUnit, targetAmount, incrementAmount, selectedUnit])

  const updateHabitAction = async () => {
    if (!habit || !hasChanges) 
      return;

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



  const renderDefaultHabitEdit = () => (
    <View>
      {/* DEFAULT HABITS INFORMATION */}
      <View style={styles.formGroup}>
        <View style={[styles.habitCard, styles.selectedHabitCard, { marginVertical: 10, alignSelf: 'stretch' }]}>
          <Ionicons 
            name={habit.icon as any} 
            size={32} 
            color={COLORS.white} 
          />
          <Text style={[styles.habitCardText, styles.selectedHabitCardText]}>
            {habit.name}
          </Text>
        </View>

        {/* DEFAULT HABIT WARNING FOR CHANGES */}

        {(selectedUnit !== originalUnit || 
          targetAmount !== habit.targetAmount.toString() || 
          incrementAmount !== habit.incrementAmount.toString()) && (
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="warning" size={16} color="orange" style={{ marginTop: -8 }}/> 
            <Text style={[styles.label, { marginLeft: 5, color: 'orange', fontSize: 12 }]}>
              These changes will reset your progress for today
            </Text>
          </View>
        )}
      </View>

      {/* DEFAULT HABIT UNIT SELECTION */}
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
      
      {/* DEFAULT HABIT TARGET AMOUNT */}
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
      
      {/* DEFAULT HABIT INCREMENT AMOUNT */}
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

  const renderCustomHabitEdit = () => (
    <View>

      {/* CUSTOM HABIT INFORMATION */}
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
      
      {/* CUSTOM HABIT ICONS */}
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

      {/* CUSTOM HABIT UNIT */}
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
      
      {/* CUSTOM HABIT TARGET AMOUNT */}
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
      
      {/* CUSTOM HABIT INCREMENT AMOUNT */}
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

      {/* CUSTOM HABIT WARNING FOR CHANGES */}
      {(customUnit !== habit.unit || 
        targetAmount !== habit.targetAmount.toString() || 
        incrementAmount !== habit.incrementAmount.toString()) && (
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="warning" size={16} color="orange" style={{ marginTop: -8 }}/> 
          <Text style={[styles.label, { marginLeft: 5, color: 'orange', fontSize: 12 }]}>
            These changes will reset your progress for today
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.container}>
      {!habit ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>Habit not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
        
          {/* ACTION BUTTONS */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { flex: 1, marginRight: 8, marginTop: 0 }]}
              onPress={() => {
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
              }}
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
      )};
      
      {/* ICON SELECTION MODAL */}
      {habit && (
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
      )};
    </ScrollView>
  )
}