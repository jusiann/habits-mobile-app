import AsyncStorage from '@react-native-async-storage/async-storage';
import enTranslations from '../locales/en';
import trTranslations from '../locales/tr';

// Kullanılabilir diller
export const AVAILABLE_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  tr: {
    code: 'tr', 
    name: 'Türkçe',
    flag: '🇹🇷'
  }
};

// Dil çevirileri
const translations = {
  en: enTranslations,
  tr: trTranslations
};

// Varsayılan dil
const DEFAULT_LANGUAGE = 'en';

// AsyncStorage anahtarı
const LANGUAGE_KEY = '@app_language';

// Mevcut dil state'i
let currentLanguage = DEFAULT_LANGUAGE;

/**
 * AsyncStorage'dan kaydedilmiş dili yükler
 */
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && translations[savedLanguage]) {
      currentLanguage = savedLanguage;
      return savedLanguage;
    }
    currentLanguage = DEFAULT_LANGUAGE;
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Dil yüklenirken hata:', error);
    currentLanguage = DEFAULT_LANGUAGE;
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Dil sistemini başlatır - uygulama başlatıldığında çağrılmalı
 */
export const initializeLanguage = async () => {
  return await loadSavedLanguage();
};

/**
 * Dili AsyncStorage'a kaydeder
 */
export const saveLanguage = async (languageCode) => {
  try {
    if (!translations[languageCode]) {
      throw new Error(`Desteklenmeyen dil kodu: ${languageCode}`);
    }
    
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    currentLanguage = languageCode;
    return true;
  } catch (error) {
    console.error('Dil kaydedilirken hata:', error);
    return false;
  }
};

/**
 * Mevcut dili döndürür
 */
export const getCurrentLanguage = () => {
  return currentLanguage;
};

/**
 * Dili değiştirir ve kaydeder
 */
export const changeLanguage = async (languageCode) => {
  const success = await saveLanguage(languageCode);
  if (success) {
    // Burada gerekirse state update eventi tetiklenebilir
    console.log(`Dil değiştirildi: ${languageCode}`);
  }
  return success;
};

/**
 * Çeviri anahtarından metni döndürür
 * Örnek kullanım: translate('welcome.title') veya translate('auth.signIn.title')
 */
export const translate = (key, params = {}) => {
  try {
    const keys = key.split('.');
    let translation = translations[currentLanguage];
    
    // Nested key'leri çözümle
    for (const k of keys) {
      if (translation && typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        // Eğer mevcut dilde bulunamazsa, varsayılan dilde ara
        translation = translations[DEFAULT_LANGUAGE];
        for (const k of keys) {
          if (translation && typeof translation === 'object' && translation[k] !== undefined) {
            translation = translation[k];
          } else {
            console.warn(`Çeviri bulunamadı: ${key}`);
            return key; // Key'in kendisini döndür
          }
        }
        break;
      }
    }
    
    // Eğer sonuç string değilse, key'i döndür
    if (typeof translation !== 'string') {
      console.warn(`Çeviri string değil: ${key}`);
      return key;
    }
    
    // Parametreleri yerine koy
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return result;
  } catch (error) {
    console.error(`Çeviri hatası (${key}):`, error);
    return key;
  }
};

/**
 * Tüm kullanılabilir dillerin listesini döndürür
 */
export const getAvailableLanguages = () => {
  return Object.values(AVAILABLE_LANGUAGES);
};

/**
 * Dil koduna göre dil bilgisini döndürür
 */
export const getLanguageInfo = (languageCode) => {
  return AVAILABLE_LANGUAGES[languageCode] || AVAILABLE_LANGUAGES[DEFAULT_LANGUAGE];
};

/**
 * Sistem dilini algıla (ileride kullanım için)
 */
export const detectSystemLanguage = () => {
  // React Native'de sistem dilini algılamak için
  // expo-localization veya react-native-localize kullanılabilir
  // Şimdilik varsayılan dili döndürüyorum
  return DEFAULT_LANGUAGE;
};

/**
 * Hook benzeri kullanım için (React Context ile birlikte kullanılabilir)
 */
export const useTranslation = () => {
  return {
    translate,
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    availableLanguages: getAvailableLanguages()
  };
};
