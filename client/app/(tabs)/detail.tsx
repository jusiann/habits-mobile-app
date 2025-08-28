import {View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native'
import CustomAlert from '../../constants/CustomAlert'
import React from 'react'
import {useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import {useHabitStore} from '../../store/habit.store'
import {CUSTOM_ICONS} from '../../constants/custom.icons'
import SafeScreen from '../../constants/SafeScreen'

export default function Detail() {
  const router = useRouter()
  const {habitId} = useLocalSearchParams()
  const {habits, updateHabit} = useHabitStore()
  const [habit, setHabit] = React.useState<any>(null)
  const [originalUnit, setOriginalUnit] = React.useState('')
  const [customName, setCustomName] = React.useState('')
  const [customIcon, setCustomIcon] = React.useState('heart-outline')
  const [customUnit, setCustomUnit] = React.useState('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [incrementAmount, setIncrementAmount] = React.useState('')
  const [selectedUnit, setSelectedUnit] = React.useState('')
  const [showIconModal, setShowIconModal] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  React.useEffect(() => {
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
  }, [habit, customName, customIcon, customUnit, targetAmount, incrementAmount, selectedUnit]);

  useFocusEffect(
    React.useCallback(() => {
      if (habitId && habits.length > 0) {
        const foundHabit = habits.find((h: any) => h.id === habitId)
        if (foundHabit) {
          setHabit(foundHabit)
          setOriginalUnit(foundHabit.unit)
          setTargetAmount(foundHabit.targetAmount.toString())
          setIncrementAmount(foundHabit.incrementAmount.toString())
          setSelectedUnit(foundHabit.unit)
          setHasChanges(false)
          
          if (foundHabit.type === 'other') {
            setCustomName(foundHabit.name)
            setCustomIcon(foundHabit.icon)
            setCustomUnit(foundHabit.unit)
          }
        }
      }
    }, [habitId, habits])
  );

  const detailHabitAction = async () => {
    if (!habit || !hasChanges) 
      return;

    setIsLoading(true)
    try {
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

      if (habit.type === 'other') {
        if (!customName.trim()) {
          setShowAlert({
            visible: true,
            title: 'Invalid Input',
            message: 'Habit name is required.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
        if (!customUnit.trim()) {
          setShowAlert({
            visible: true,
            title: 'Invalid Input',
            message: 'Unit is required.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          })
          return;
        }
      }

      const result = await updateHabit(habit.id, updateData)
      if (result.success) {
        setShowAlert({
          visible: true,
          title: 'Success',
          message: 'Habit updated successfully!',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'default' }]
        });
      } else {
        setShowAlert({
          visible: true,
          title: 'Update Failed',
          message: result.message || 'Failed to update habit',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        })
      }
    } catch (error) {
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
                  title: 'Unsaved Changes',
                  message: 'You have unsaved changes. Are you sure you want to leave?',
                  type: 'warning',
                  buttons: [
                    { text: 'Stay', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'cancel' },
                    { text: 'Leave', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'destructive' }
                  ]
                })
              } else {
                router.back()
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
              Back
            </Text>
          </TouchableOpacity>
          
          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={{
              opacity: (!hasChanges || isLoading) ? 0.5 : 1
            }}
            onPress={detailHabitAction}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={25} color={COLORS.primary} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.primary
              }}>
                Save
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
      {!habit ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>Habit not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          
          {/* HEADER SECTION */}
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
        </View>
      )}
      
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
      )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};