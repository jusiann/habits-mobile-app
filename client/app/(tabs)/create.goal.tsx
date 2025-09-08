import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useHabitStore} from '../../store/habit.store';
import SafeScreen from '../../constants/SafeScreen';
import CustomAlert from '../../constants/CustomAlert';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/create.goal.styles';

export default function CreateGoal() {
  const {habits, fetchPresets, fetchHabits, fetchGoals, createGoal} = useHabitStore();
  const [type, setType] = React.useState('complete');
  const [selectedHabitId, setSelectedHabitId] = React.useState(null);
  const [repeat, setRepeat] = React.useState('');
  const [metric, setMetric] = React.useState('streak');
  const [value, setValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    buttons: [] as { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  });

  const createGoalAction = async () => {
    try {
      setIsSubmitting(true);
      let payload: any = { type };

      if (type === 'complete') {
        if (!selectedHabitId) {
          setShowAlert({
            visible: true,
            title: 'Missing Information',
            message: 'Please select a preset habit.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          });
          return;
        }
        const r = Number.parseInt(String(repeat || '').trim(), 10);
        if (!Number.isInteger(r) || r <= 0) {
          setShowAlert({
            visible: true,
            title: 'Invalid Input',
            message: 'Repeat must be a number greater than 0.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          });
          return;
        }
        payload.habitId = selectedHabitId;
        payload.repeat = r;
      } else if (type === 'reach') {
        const v = Number.parseInt(String(value || '').trim(), 10);
        if (!Number.isInteger(v) || v <= 0) {
          setShowAlert({
            visible: true,
            title: 'Invalid Input',
            message: 'Value must be a number greater than 0.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          });
          return;
        }
        payload.metric = metric;
        payload.value = v;
      }

      const res = await createGoal(payload);
      if (!res || !res.success) {
        setShowAlert({
          visible: true,
          title: 'Creation Failed',
          message: res?.message || 'Failed to create goal. Please try again.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      try { await fetchGoals(); } catch { }

      setShowAlert({
        visible: true,
        title: 'Goal Created',
        message: 'Your goal has been created successfully.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'default' }]
      });
    } catch (error) {
      setShowAlert({
        visible: true,
        title: 'Creation Failed',
        message: error?.message || 'An unexpected error occurred.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAction = () => {
    setShowAlert({
      visible: true,
      title: 'Cancel Goal Creation',
      message: 'Are you sure you want to cancel creating this goal?',
      type: 'warning',
      buttons: [
        { text: 'Stay', onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'cancel' },
        { text: 'Cancel', onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'destructive' }
      ]
    });
  };

  React.useEffect(() => {
    fetchPresets().catch(() => {});
    fetchHabits().catch(() => {});
  }, [fetchPresets, fetchHabits]);

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
        {/* HEADER SECTION */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 4,
          backgroundColor: COLORS.background
        }}>

          {/* CANCEL BUTTON */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={cancelAction}
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
              Cancel
            </Text>
          </TouchableOpacity>

          {/* ADD BUTTON */}
          <TouchableOpacity
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
            onPress={createGoalAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size={25} color={COLORS.primary} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary }}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollViewStyle} 
          contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* MAIN FORM CARD */}
          <View style={styles.card}>

            {/* GOAL TYPE SELECTION */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'complete' && styles.selectedTypeButton]} 
                onPress={() => setType('complete')}
              >
                <Text style={[styles.typeButtonText, type === 'complete' && styles.selectedTypeButtonText]}>
                  Complete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'reach' && styles.selectedTypeButton]} 
                onPress={() => setType('reach')}
              >
                <Text style={[styles.typeButtonText, type === 'reach' && styles.selectedTypeButtonText]}>
                  Reach
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'maintain' && styles.selectedTypeButton]} 
                onPress={() => setType('maintain')}
              >
                <Text style={[styles.typeButtonText, type === 'maintain' && styles.selectedTypeButtonText]}>
                  Maintain
                </Text>
              </TouchableOpacity>
            </View>

            {/* COMPLETE TYPE INPUTS */}
            {type === 'complete' && (
              <View style={{ marginTop: 12 }}>
                {/* PRESET HABITS SELECTION */}
                <Text style={styles.label}>Preset Habits</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                  {habits && habits.map(h => (
                    <TouchableOpacity 
                      key={h.id} 
                      style={[styles.habitCard, selectedHabitId === h.id && styles.selectedHabitCard]} 
                      onPress={() => setSelectedHabitId(h.id)}
                    >
                      <Ionicons 
                        name={h.icon || 'checkmark-circle'} 
                        size={20} 
                        color={selectedHabitId === h.id ? COLORS.white : COLORS.textPrimary} 
                      />
                      <Text style={[styles.habitCardText, selectedHabitId === h.id && styles.selectedHabitCardText]}>
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* REPEAT INPUT */}
                <Text style={styles.label}>Repeat</Text>
                <View style={styles.inputContainer}>
                  <TextInput 
                    value={repeat} 
                    onChangeText={setRepeat} 
                    keyboardType="numeric" 
                    style={styles.input} 
                    placeholder="How many times" 
                  />
                </View>
              </View>
            )}

            {/* REACH TYPE INPUTS */}
            {type === 'reach' && (
              <View style={{ marginTop: 12 }}>
                {/* METRIC SELECTION */}
                <Text style={styles.label}>Metric</Text>
                <View style={styles.unitContainer}>
                  <TouchableOpacity 
                    style={[styles.unitButton, metric === 'streak' && styles.selectedUnitButton]} 
                    onPress={() => setMetric('streak')}
                  >
                    <Text style={[styles.unitButtonText, metric === 'streak' && styles.selectedTypeButtonText]}>
                      Streak
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.unitButton, metric === 'rate' && styles.selectedUnitButton]} 
                    onPress={() => setMetric('rate')}
                  >
                    <Text style={[styles.unitButtonText, metric === 'rate' && styles.selectedTypeButtonText]}>
                      Rate
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* VALUE INPUT */}
                <Text style={styles.label}>Value</Text>
                <View style={styles.inputContainer}>
                  <TextInput 
                    value={value} 
                    onChangeText={setValue} 
                    keyboardType="numeric" 
                    style={styles.input} 
                    placeholder="Target value" 
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
