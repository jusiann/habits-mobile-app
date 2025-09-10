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
    marginBottom: 8,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginHorizontal: 0,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
  },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginHorizontal: 0,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },

  // Habit Cards
  habitCard: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedHabitCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  habitCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedHabitCardText: {
    color: COLORS.white,
  },

  // Unit Container
  unitContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginHorizontal: 0,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedUnitButton: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  selectedUnitButtonText: {
    color: COLORS.white,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Button Container
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default styles;
