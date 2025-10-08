import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topIllustration: {
    alignItems: "center",
    width: "100%",
  },
  illustrationImage: {
    width: width * 0.75,
    height: width * 0.75,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginTop: -24,
  },
  header: {
    alignItems: "center",
    marginBottom: 0, // Custom: reduced margin
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  titleFirst: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 0, // Custom: no spacing between titles
  },
  titleSecond: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12, // Custom: small spacing after second title
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  subtitleSpaced: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 50, // Custom: more spacing before buttons
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
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
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    marginRight: 5,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  
  // Habits card styles
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  habitsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitMenuButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitMenuText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default createStyles;
