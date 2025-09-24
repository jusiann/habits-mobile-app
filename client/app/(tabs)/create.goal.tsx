import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useHabitStore} from '../../store/habit.store';
import SafeScreen from '../../constants/SafeScreen';
import CustomAlert from '../../constants/CustomAlert';
import COLORS from '../../constants/colors';
import styles from '../../assets/styles/create.goal.styles';
import {translate} from '../../constants/language.utils';

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
            title: translate('alerts.missingInfo'),
            message: translate('alerts.missingInfo'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
          });
          return;
        }
        const r = Number.parseInt(String(repeat || '').trim(), 10);
        if (!Number.isInteger(r) || r <= 0) {
          setShowAlert({
            visible: true,
            title: translate('alerts.error'),
            message: translate('alerts.error'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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
            title: translate('alerts.error'),
            message: translate('alerts.error'),
            type: 'error',
            buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
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
          title: translate('goals.create.failed'),
          message: res?.message || translate('goals.create.failedMessage'),
          type: 'error',
          buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
        });
        return;
      }

      try { await fetchGoals(); } catch { }

      setShowAlert({
        visible: true,
        title: translate('goals.create.success'),
        message: translate('goals.create.successMessage'),
        type: 'success',
        buttons: [{ text: translate('common.ok'), onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'default' }]
      });
    } catch (error) {
      setShowAlert({
        visible: true,
        title: translate('goals.create.failed'),
        message: error?.message || translate('goals.create.unexpectedError'),
        type: 'error',
        buttons: [{ text: translate('common.ok'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'default' }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAction = () => {
    setShowAlert({
      visible: true,
      title: translate('goals.create.cancelTitle'),
      message: translate('goals.create.cancelMessage'),
      type: 'warning',
      buttons: [
        { text: translate('common.stay'), onPress: () => setShowAlert(previous => ({ ...previous, visible: false })), style: 'cancel' },
        { text: translate('common.cancel'), onPress: () => { setShowAlert(previous => ({ ...previous, visible: false })); router.back(); }, style: 'destructive' }
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
              {translate('common.cancel')}
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary }}>{translate('goals.create.add')}</Text>
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

            {/* HEADER SECTION */}
            <View style={styles.header}>
              <Text style={styles.title}>{translate('goals.create.title')}</Text>
              <Text style={styles.subtitle}>{translate('goals.create.subtitle')}</Text>
            </View>

            {/* FORM SECTION */}
            <View style={styles.form}>

              {/* GOAL TYPE SELECTION */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('goals.create.type')}</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[styles.typeButton, type === 'complete' && styles.selectedTypeButton]} 
                    onPress={() => setType('complete')}
                  >
                    <Text style={[styles.typeButtonText, type === 'complete' && styles.selectedTypeButtonText]}>
                      {translate('goals.create.complete')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeButton, type === 'reach' && styles.selectedTypeButton]} 
                    onPress={() => setType('reach')}
                  >
                    <Text style={[styles.typeButtonText, type === 'reach' && styles.selectedTypeButtonText]}>
                      {translate('goals.create.reach')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeButton, type === 'maintain' && styles.selectedTypeButton]} 
                    onPress={() => setType('maintain')}
                  >
                    <Text style={[styles.typeButtonText, type === 'maintain' && styles.selectedTypeButtonText]}>
                      {translate('goals.create.maintain')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* COMPLETE TYPE INPUTS */}
              {type === 'complete' && (
                <View>
                  {/* PRESET HABITS SELECTION */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('goals.create.presetHabits')}</Text>
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
                  </View>

                  {/* REPEAT INPUT */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('goals.create.repeat')}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        value={repeat} 
                        onChangeText={setRepeat} 
                        keyboardType="numeric" 
                        style={styles.input} 
                        placeholder={translate('goals.create.repeatPlaceholder')} 
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* REACH TYPE INPUTS */}
              {type === 'reach' && (
                <View>
                  {/* METRIC SELECTION */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('goals.create.metric')}</Text>
                    <View style={styles.unitContainer}>
                      <TouchableOpacity 
                        style={[styles.unitButton, metric === 'streak' && styles.selectedUnitButton]} 
                        onPress={() => setMetric('streak')}
                      >
                        <Text style={[styles.unitButtonText, metric === 'streak' && styles.selectedUnitButtonText]}>
                          {translate('goals.create.streak')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.unitButton, metric === 'rate' && styles.selectedUnitButton]} 
                        onPress={() => setMetric('rate')}
                      >
                        <Text style={[styles.unitButtonText, metric === 'rate' && styles.selectedUnitButtonText]}>
                          {translate('goals.create.rate')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* VALUE INPUT */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('goals.create.value')}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        value={value} 
                        onChangeText={setValue} 
                        keyboardType="numeric" 
                        style={styles.input} 
                        placeholder={translate('goals.create.valuePlaceholder')} 
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
