export default {
  // Karşılama/Giriş Sayfası
  welcome: {
    title: "Hoş Geldiniz",
    appName: "Alışkanlık Uygulaması",
    subtitle: "Günlük alışkanlıklarınızı takip edin ve daha iyi rutinler oluşturun",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol"
  },

  // Kimlik Doğrulama
  auth: {
    // Giriş Yap
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

    // Kayıt Ol
    signUp: {
      title: "Hesap Oluştur",
      subtitle: "Başlamak için kayıt olun",
      username: "Kullanıcı Adı",
      usernamePlaceholder: "Kullanıcı adınızı girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresinizi girin",
      fullName: "Ad Soyad",
      fullNamePlaceholder: "Ad soyadınızı girin",
      password: "Şifre",
      passwordPlaceholder: "Şifrenizi girin",
      confirmPassword: "Şifreyi Onayla",
      confirmPasswordPlaceholder: "Şifrenizi tekrar girin",
      signUpButton: "Kayıt Ol",
      haveAccount: "Zaten hesabınız var mı?",
      signInLink: "Giriş Yap"
    },

    // Şifre Sıfırlama
    forgotPassword: {
      title: "Şifreyi Sıfırla",
      subtitle: "Şifrenizi sıfırlamak için e-posta adresinizi girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresinizi girin",
      resetButton: "Şifreyi Sıfırla",
      backToSignIn: "Giriş Sayfasına Dön"
    },

    // Şifre Değiştir
    changePassword: {
      title: "Şifre Değiştir",
      currentPassword: "Mevcut Şifre",
      newPassword: "Yeni Şifre",
      confirmNewPassword: "Yeni Şifreyi Onayla",
      changeButton: "Şifre Değiştir"
    }
  },

  // Ana Sayfa/Kontrol Paneli
  home: {
    greeting: {
      morning: "Günaydın",
      afternoon: "İyi Öğleden Sonra",
      evening: "İyi Akşamlar",
      night: "İyi Geceler"
    },
    habitsTitle: "ALIŞKANLİKLAR",
    emptyState: {
      title: "Yeni bir alışkanlık ekle",
      subtitle: "İlk alışkanlığınızı ekleyerek daha iyi rutinler oluşturmaya başlayın"
    },
    actionButton: "+"
  },

  // Alışkanlıklar
  habits: {
    create: {
      title: "Yeni Alışkanlık Oluştur",
      subtitle: "Hazır bir alışkanlık seçin veya kendiniz oluşturun",
      habitType: "Alışkanlık Türü",
      chooseDefault: "Varsayılan Alışkanlık Seç",
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
      incrementAmountPlaceholder: "Artış miktarını girin"
    },

    detail: {
      title: "Alışkanlığı Düzenle",
      habitNotFound: "Alışkanlık bulunamadı",
      goBack: "Geri Dön",
      deleteHabit: "Alışkanlığı Sil",
      chooseIcon: "İkon Seç"
    }
  },

  // Hedefler
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
      presetHabits: "Hazır Alışkanlıklar",
      repeat: "Tekrar",
      metric: "Metrik",
      value: "Değer",
      add: "Ekle"
    }
  },

  // Geçmiş
  history: {
    title: "Geçmiş",
    stats: {
      currentStreak: "Mevcut Seri",
      completionRate: "Tamamlama Oranı",
      totalCompleted: "Toplam Tamamlanan"
    }
  },

  // Profil
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
    ageUnit: "yaş",
    height: "Boy",
    weight: "Kilo",
    notSpecified: "Belirtilmemiş"
  },

  // Profil Güncelle
  update: {
    fullName: "Ad Soyad *",
    fullNameRequired: "Ad soyad gereklidir",
    age: "Yaş",
    height: "Boy (cm)",
    weight: "Kilo (kg)",
    changePassword: "Şifre Değiştir"
  },

  // Ortak
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
    info: "Bilgi"
  },

  // Navigasyon
  navigation: {
    home: "Ana Sayfa",
    history: "Geçmiş",
    goals: "Hedefler",
    profile: "Profil"
  },

  // Uyarılar/Mesajlar
  alerts: {
    missingInfo: "Eksik Bilgi",
    invalidEmail: "Geçersiz E-posta",
    passwordMismatch: "Şifreler Uyuşmuyor",
    signInSuccessful: "Giriş Başarılı",
    signInFailed: "Giriş Başarısız",
    signUpSuccessful: "Kayıt Başarılı",
    signUpFailed: "Kayıt Başarısız"
  },

  // Varsayılan Alışkanlık İsimleri (6 sistem önayarı)
  habitNames: {
    Water: "Su",
    Food: "Yemek",
    Walking: "Yürüyüş",
    Exercise: "Egzersiz", 
    Reading: "Okuma",
    Sleep: "Uyku"
  },

  // Birimler
  units: {
    glasses: "bardak",
    meals: "öğün",
    steps: "adım",
    minutes: "dakika", 
    pages: "sayfa",
    hours: "saat",
    liters: "litre",
    servings: "porsiyon",
    portions: "porsiyon",
    kilometers: "kilometre",
    sessions: "seans",
    chapters: "bölüm"
  }
};