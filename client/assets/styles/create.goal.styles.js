import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
    marginHorizontal: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 50,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },

  // Habit Cards
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    minWidth: 120,
  },
  selectedHabitCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  habitCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
    textAlign: 'center',
  },
  selectedHabitCardText: {
    color: COLORS.white,
  },

  // Unit Container
  unitContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    padding: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUnitButton: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textArea: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Goal Type Selection
  goalTypeContainer: {
    marginBottom: 24,
  },
  goalTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTypeOption: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
  },
  goalTypeOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  goalTypeTextSelected: {
    color: COLORS.white,
  },
  goalTypeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  goalTypeDescriptionSelected: {
    color: COLORS.white,
    opacity: 0.9,
  },

  // Habit Selection
  habitSelectionContainer: {
    marginBottom: 20,
  },
  habitOption: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIconSelected: {
    backgroundColor: COLORS.white,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  habitNameSelected: {
    color: COLORS.white,
  },
  habitDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  habitDescriptionSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },

  // Number Input
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 4,
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  numberButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.3,
  },
  numberInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },

  // Metric Selection (for reach goals)
  metricContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metricOption: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
  },
  metricOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metricTextSelected: {
    color: COLORS.white,
  },

  // Action Buttons
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Validation
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  successText: {
    color: COLORS.success,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Preview Section
  previewContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    lineHeight: 22,
  },
  previewMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default styles;
