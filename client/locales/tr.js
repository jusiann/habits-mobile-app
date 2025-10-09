export default {
  // Welcome/Landing Page
  welcome: {
    title: "Hoş Geldiniz",
    appName: "Alışkanlık Uygulaması",
    subtitle: "Günlük alışkanlıklarınızı takip edin ve daha iyi rutinler oluşturun",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol"
  },

  // Authentication
  auth: {
    // Sign In
    signIn: {
      title: "Giriş Yap",
      emailOrUsername: "E-posta veya Kullanıcı Adı",
      emailOrUsernamePlaceholder: "E-posta veya kullanıcı adınızı girin",
      password: "Şifre",
      passwordPlaceholder: "Şifrenizi girin",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      resetPassword: "Şifreyi Sıfırla",
      signInButton: "Giriş Yap",
      noAccount: "Hesabınız yok mu?",
      signUpLink: "Kayıt Ol"
    },

    // Sign Up
    signUp: {
      title: "Hesap Oluştur",
      subtitle: "Başlamak için kayıt olun",
      username: "Kullanıcı Adı",
      usernamePlaceholder: "Kullanıcı adınızı girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresinizi girin",
      fullName: "Ad Soyad",
      fullNamePlaceholder: "Adınızı ve soyadınızı girin",
      password: "Şifre",
      passwordPlaceholder: "Şifrenizi girin",
      confirmPassword: "Şifreyi Onayla",
      confirmPasswordPlaceholder: "Şifrenizi tekrar girin",
      signUpButton: "Kayıt Ol",
      haveAccount: "Zaten hesabınız var mı?",
      signInLink: "Giriş Yap"
    },

    // Reset Password
    forgotPassword: {
      title: "Şifreyi Sıfırla",
      subtitle: "Şifrenizi sıfırlamak için e-posta adresinizi girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresinizi girin",
      resetButton: "Şifreyi Sıfırla",
      backToSignIn: "Giriş Sayfasına Geri Dön"
    },

    // Change Password
    changePassword: {
      title: "Şifre Değiştir",
      currentPassword: "Mevcut Şifre",
      newPassword: "Yeni Şifre",
      confirmNewPassword: "Yeni Şifreyi Onayla",
      changeButton: "Şifreyi Değiştir",
      successMessage: "Şifre başarıyla değiştirildi!",
      errorMessage: "Şifre değiştirilirken bir hata oluştu"
    }
  },

  // Home/Dashboard
  home: {
    greeting: {
      morning: "Günaydın",
      afternoon: "Tünaydın",
      evening: "İyi Akşamlar",
      night: "İyi Geceler"
    },
    habitsTitle: "ALIŞKANLIKLAR",
    emptyState: {
      title: "Yeni bir alışkanlık ekleyin",
      subtitle: "İlk alışkanlığınızı ekleyerek daha iyi rutinler oluşturmaya başlayın"
    },
    actionButton: "+"
  },

  // Habits
  habits: {
    create: {
      title: "Yeni Alışkanlık Oluştur",
      subtitle: "Hazır bir alışkanlık seçin veya kendiniz oluşturun",
      habitType: "Alışkanlık Türü",
      defaultHabit: "Varsayılan",
      customHabit: "Özel",
      chooseDefault: "Varsayılan Bir Alışkanlık Seçin",
      chooseDefaultTitle: "Varsayılan Bir Alışkanlık Seçin",
      failedToLoad: "Önayarlar yüklenemedi:",
      retry: "Tekrar Dene",
      noPresets: "Önayar bulunmuyor",
      habitName: "Alışkanlık Adı",
      habitNamePlaceholder: "Alışkanlık adını girin",
      icon: "İkon",
      iconSelector: "İkonu değiştirmek için dokunun",
      unit: "Birim",
      unitPlaceholder: "Birim girin (örn. bardak, dakika)",
      targetAmount: "Hedef Miktar",
      targetAmountPlaceholder: "Hedef miktarı girin",
      incrementAmount: "Artış Miktarı",
      incrementAmountPlaceholder: "Artış miktarını girin",
      createButton: "Oluştur",
      successMessage: "Alışkanlık başarıyla oluşturuldu!",
      failed: "Alışkanlık Oluşturma Başarısız",
      failedMessage: "Alışkanlık oluşturulamadı"
    },

    detail: {
      title: "Alışkanlığı Düzenle",
      habitNotFound: "Alışkanlık bulunamadı",
      goBack: "Geri Dön",
      deleteHabit: "Alışkanlığı Sil",
      chooseIcon: "İkon Seç",
      habitName: "Alışkanlık Adı",
      habitNamePlaceholder: "Alışkanlık adını girin",
      icon: "İkon",
      unit: "Birim",
      targetAmount: "Hedef Miktar",
      targetAmountPlaceholder: "Hedef miktarı girin",
      incrementAmount: "Artış Miktarı",
      incrementAmountPlaceholder: "Artış miktarını girin",
      save: "Kaydet",
      resetWarning: "Bu değişiklikler bugünkü ilerlemenizi sıfırlayacak",
      progressResetWarning: "Bu değişiklikler bugünkü ilerlemenizi sıfırlayacak",
      tapToChangeIcon: "İkonu değiştirmek için dokunun"
    },

    // Habit Names
    water: "Su",
    food: "Yemek",
    walking: "Yürüyüş",
    exercise: "Egzersiz",
    reading: "Okuma",
    sleep: "Uyku"
  },

  // Goals
  goals: {
    title: "HEDEFLER",
    emptyState: {
      title: "Henüz hedef yok",
      subtitle: "Bir hedef oluşturmak ve ilerleme kaydetmek için + simgesine dokunun"
    },
    create: {
      title: "Yeni Hedef Oluştur",
      subtitle: "Hedefinizi belirleyin ve ilerlemenizi takip edin",
      type: "Tür",
      complete: "Tamamla",
      reach: "Ulaş",
      maintain: "Sürdür",
      presetHabits: "Hazır Alışkanlıklar",
      repeat: "Tekrar",
      repeatPlaceholder: "Kaç kez tekrarlanacak?",
      metric: "Metrik",
      streak: "Seri",
      rate: "Oran",
      value: "Hedef Değer",
      valuePlaceholder: "Hedef değeri girin",
      add: "Ekle",
      cancelTitle: "Hedef Oluşturmayı İptal Et",
      cancelMessage: "Bu hedefi oluşturmayı iptal etmek istediğinizden emin misiniz?",
      failed: "Oluşturma Başarısız",
      failedMessage: "Hedef oluşturulamadı. Lütfen tekrar deneyin.",
      success: "Hedef Oluşturuldu",
      successMessage: "Hedefiniz başarıyla oluşturuldu.",
      unexpectedError: "Beklenmedik bir hata oluştu."
    },

    delete: {
      title: "Hedefi Sil",
      message: "Bu hedefi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      cancel: "İptal",
      confirm: "Sil",
      failed: "Silme Başarısız",
      failedMessage: "Hedef silinemedi. Lütfen tekrar deneyin."
    },

    types: {
      complete: "Tamamlama",
      reach: "Ulaşma",
      maintain: "Sürdürme",
      habits: "alışkanlık"
    }
  },

  // History
  history: {
    title: "Geçmiş",
    months: {
      january: "Ocak",
      february: "Şubat",
      march: "Mart",
      april: "Nisan",
      may: "Mayıs",
      june: "Haziran",
      july: "Temmuz",
      august: "Ağustos",
      september: "Eylül",
      october: "Ekim",
      november: "Kasım",
      december: "Aralık"
    },
    days: {
      sunday: "Pazar",
      monday: "Pazartesi",
      tuesday: "Salı",
      wednesday: "Çarşamba",
      thursday: "Perşembe",
      friday: "Cuma",
      saturday: "Cumartesi"
    },
    daysShort: {
      sunday: "Paz",
      monday: "Pzt",
      tuesday: "Sal",
      wednesday: "Çar",
      thursday: "Per",
      friday: "Cum",
      saturday: "Cmt"
    },
    stats: {
      currentStreak: "Mevcut Seri",
      completionRate: "Tamamlama Oranı",
      totalCompleted: "Toplam Tamamlanan"
    },
    selectedDay: {
      totalHabits: "Toplam Alışkanlık",
      completedHabits: "Tamamlanan",
      inProgress: "Devam Eden",
      notStarted: "Başlanmamış"
    }
  },

  // Profile
  profile: {
    personalInfo: "Kişisel Bilgiler",
    generalSettings: "Genel Ayarlar",
    editProfile: "Profili Düzenle",
    logout: "Çıkış Yap",
    changePicture: "Resim Değiştir",
    chooseAvatar: "Avatar Seç",
    gender: {
      label: "Cinsiyet",
      male: "Erkek",
      female: "Kadın",
      other: "Diğer"
    },
    age: "Yaş",
    ageUnit: "yıl",
    height: "Boy",
    weight: "Kilo",
    notSpecified: "Belirtilmemiş",
    logoutSuccess: "Başarıyla çıkış yapıldı",
    logoutFailed: "Çıkış başarısız"
  },

  // Update Profile
  update: {
    title: "Profili Güncelle",
    back: "Geri",
    save: "Kaydet",
    fullName: "Ad Soyad *",
    fullNameRequired: "Ad soyad alanı gereklidir",
    age: "Yaş",
    height: "Boy (cm)",
    weight: "Kilo (kg)",
    changePassword: "Şifre Değiştir",
    changePicture: "Resim Değiştir",
    chooseAvatar: "Avatar Seç",
    avatars: "Avatarlar",
    theme: "Tema",
    chooseTheme: "Tema Seç",
    themes: "Temalar",
    themeChanged: "Tema başarıyla değiştirildi.",
    themeChangeError: "Tema değiştirilemedi.",
    unsavedChanges: "Kaydedilmemiş Değişiklikler",
    unsavedChangesMessage: "Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinizden emin misiniz?",
    stay: "Kal",
    leave: "Çık",
    currentPassword: "Mevcut Şifre",
    currentPasswordPlaceholder: "Mevcut şifrenizi girin",
    newPassword: "Yeni Şifre",
    newPasswordPlaceholder: "Yeni şifrenizi girin",
    confirmPassword: "Yeni Şifreyi Onayla",
    confirmPasswordPlaceholder: "Yeni şifrenizi onaylayın",
    passwordFieldsRequired: "Tüm şifre alanları doldurulmalıdır.",
    passwordMismatch: "Yeni şifreler eşleşmiyor.",
    samePassword: "Yeni şifre mevcut şifreden farklı olmalıdır.",
    passwordChangeSuccess: "Şifre başarıyla değiştirildi.",
    profileUpdateSuccess: "Profil başarıyla güncellendi.",
    fullNameError: "Ad soyad alanı boş olamaz.",
    fullNameLengthError: "Ad soyad en az 2 karakter olmalıdır.",
    ageError: "Yaş 0-150 yıl arasında olmalıdır.",
    heightError: "Boy 0-300 cm arasında olmalıdır.",
    weightError: "Kilo 0-500 kg arasında olmalıdır.",
    language: "Dil",
    changeLanguage: "Dil başarıyla değiştirildi",
    languageChangeError: "Dil değiştirilemedi. Lütfen tekrar deneyin."
  },

  // Common
  common: {
    ok: "Tamam",
    cancel: "İptal",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    add: "Ekle",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    warning: "Uyarı",
    info: "Bilgi",
    back: "Geri",
    stay: "Kal",
    leave: "Ayrıl"
  },

  // Navigation
  navigation: {
    home: "Ana Sayfa",
    history: "Geçmiş",
    goals: "Hedefler",
    profile: "Profil"
  },

  // Alerts/Messages
  alerts: {
    missingInfo: "Eksik Bilgi",
    invalidEmail: "Geçersiz E-posta",
    passwordMismatch: "Şifreler Eşleşmiyor",
    signInSuccessful: "Giriş Başarılı",
    signInFailed: "Giriş Başarısız",
    signUpSuccessful: "Kayıt Başarılı",
    signUpFailed: "Kayıt Başarısız",
    unsavedChanges: "Kaydedilmemiş Değişiklikler",
    unsavedChangesMessage: "Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinizden emin misiniz?",
    success: "Başarılı",
    habitUpdatedSuccessfully: "Alışkanlık başarıyla güncellendi!",
    updateFailed: "Güncelleme Başarısız",
    failedToUpdateHabit: "Alışkanlık güncellenemedi",
    deleteHabit: "Alışkanlığı Sil",
    deleteHabitMessage: "Bu alışkanlığı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    habitDeletedSuccessfully: "Alışkanlık başarıyla silindi!",
    deleteFailed: "Silme Başarısız",
    failedToDeleteHabit: "Alışkanlık silinemedi",
    invalidInput: "Geçersiz Giriş",
    targetAmountError: "Hedef miktar pozitif bir sayı olmalıdır.",
    incrementAmountError: "Artış miktarı pozitif bir sayı olmalıdır.",
    connectionError: {
      title: "Bağlantı Hatası",
      message: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin."
    },
    networkError: {
      title: "Ağ Hatası",
      message: "Ağ isteği başarısız oldu. Lütfen tekrar deneyin."
    },
    validationError: {
      title: "Doğrulama Hatası",
      message: "Girişlerinizi kontrol edip tekrar deneyin."
    },
    error: {
      title: "Hata",
      message: "Bir hata oluştu. Lütfen tekrar deneyin."
    }
  },

  // Units
  units: {
    glasses: "bardak",
    meals: "öğün",
    steps: "adım",
    minutes: "dakika",
    pages: "sayfa",
    hours: "saat",
    liters: "litre",
    cups: "fincan",
    servings: "porsiyon",
    portions: "porsiyon",
    kilometers: "kilometre",
    sessions: "seans",
    chapters: "bölüm"
  }
};
