export default {
  // Welcome/Landing Page
  welcome: {
    title: "Welcome to",
    appName: "Habits App",
    subtitle: "Track your daily habits and build better routines",
    signIn: "Sign In",
    signUp: "Sign Up"
  },

  // Authentication
  auth: {
    // Sign In
    signIn: {
      title: "Sign In",
      emailOrUsername: "Email or Username",
      emailOrUsernamePlaceholder: "Enter your email or username",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot your password?",
      resetPassword: "Reset Password",
      signInButton: "Sign In",
      noAccount: "Don't have an account ?",
      signUpLink: "Sign Up"
    },

    // Sign Up
    signUp: {
      title: "Create an Account",
      subtitle: "Sign up to get started",
      username: "Username",
      usernamePlaceholder: "Enter your Username",
      email: "Email",
      emailPlaceholder: "Enter your Email",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your Full Name",
      password: "Password",
      passwordPlaceholder: "Enter your Password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Enter your Confirm Password",
      signUpButton: "Sign Up",
      haveAccount: "Already have an account ?",
      signInLink: "Sign In"
    },

    // Password Reset
    forgotPassword: {
      title: "Reset Password",
      subtitle: "Enter your email to reset password",
      email: "Email",
      emailPlaceholder: "Enter your email",
      resetButton: "Reset Password",
      backToSignIn: "Back to Sign In"
    },

    // Change Password
    changePassword: {
      title: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      changeButton: "Change Password"
    }
  },

  // Home/Dashboard
  home: {
    greeting: {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
      night: "Good Night"
    },
    habitsTitle: "HABITS",
    emptyState: {
      title: "Add a new habit",
      subtitle: "Start building better routines by adding your first habit"
    },
    actionButton: "+"
  },

  // Habits
  habits: {
    create: {
      title: "Create New Habit",
      subtitle: "Choose a preset habit or create your own",
      habitType: "Habit Type",
      chooseDefault: "Choose a Default Habit",
      failedToLoad: "Failed to load presets:",
      retry: "Retry",
      noPresets: "No presets available",
      habitName: "Habit Name",
      habitNamePlaceholder: "Enter habit name",
      icon: "Icon",
      iconSelector: "Tap to change icon",
      unit: "Unit",
      unitPlaceholder: "Enter unit (e.g., glasses, minutes)",
      targetAmount: "Target Amount",
      targetAmountPlaceholder: "Enter target amount",
      incrementAmount: "Increment Amount",
      incrementAmountPlaceholder: "Enter increment amount"
    },

    detail: {
      title: "Edit Habit",
      habitNotFound: "Habit not found",
      goBack: "Go Back",
      deleteHabit: "Delete Habit",
      chooseIcon: "Choose Icon"
    }
  },

  // Goals
  goals: {
    title: "GOALS",
    emptyState: {
      title: "No goals yet",
      subtitle: "Tap + to create a goal and track progress"
    },
    create: {
      title: "Create New Goal",
      subtitle: "Set your goal and track your progress",
      type: "Type",
      presetHabits: "Preset Habits",
      repeat: "Repeat",
      metric: "Metric",
      value: "Value",
      add: "Add"
    }
  },

  // History
  history: {
    title: "History",
    stats: {
      currentStreak: "Current Streak",
      completionRate: "Completion Rate",
      totalCompleted: "Total Completed"
    }
  },

  // Profile
  profile: {
    personalInfo: "Personal Information",
    generalSettings: "General Settings",
    editProfile: "Edit Profile",
    logout: "Logout",
    changePicture: "Change Picture",
    chooseAvatar: "Choose Avatar",
    gender: {
      label: "Gender",
      male: "Male",
      female: "Female",
      other: "Other"
    },
    age: "Age",
    ageUnit: "years",
    height: "Height",
    weight: "Weight",
    notSpecified: "Not specified"
  },

  // Update Profile
  update: {
    fullName: "Full Name *",
    fullNameRequired: "Full name is required",
    age: "Age",
    height: "Height (cm)",
    weight: "Weight (kg)",
    changePassword: "Change Password"
  },

  // Common
  common: {
    ok: "OK",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info"
  },

  // Navigation
  navigation: {
    home: "Home",
    history: "History",
    goals: "Goals",
    profile: "Profile"
  },

  // Alerts/Messages
  alerts: {
    missingInfo: "Missing Information",
    invalidEmail: "Invalid Email",
    passwordMismatch: "Password Mismatch",
    signInSuccessful: "Sign In Successful",
    signInFailed: "Sign In Failed",
    signUpSuccessful: "Sign Up Successful",
    signUpFailed: "Sign Up Failed"
  },

  // Default Habit Names (6 system presets)
  habitNames: {
    Water: "Water",
    Food: "Food", 
    Walking: "Walking",
    Exercise: "Exercise",
    Reading: "Reading",
    Sleep: "Sleep"
  },

  // Units
  units: {
    glasses: "glasses",
    meals: "meals",
    steps: "steps", 
    minutes: "minutes",
    pages: "pages",
    hours: "hours",
    liters: "liters",
    servings: "servings",
    portions: "portions",
    kilometers: "kilometers",
    sessions: "sessions",
    chapters: "chapters"
  }
};