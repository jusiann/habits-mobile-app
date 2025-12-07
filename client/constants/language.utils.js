import AsyncStorage from '@react-native-async-storage/async-storage';
import enTranslations from '../locales/en';
import trTranslations from '../locales/tr';

export const AVAILABLE_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
};

const translations = {
  en: enTranslations,
  tr: trTranslations
};

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_KEY = '@app_language';
let currentLanguage = DEFAULT_LANGUAGE;

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
    currentLanguage = DEFAULT_LANGUAGE;
    return DEFAULT_LANGUAGE;
  }
};

export const initializeLanguage = async () => {
  return await loadSavedLanguage();
};

export const saveLanguage = async (languageCode) => {
  try {
    if (!translations[languageCode]) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    currentLanguage = languageCode;
    return true;
  } catch (error) {
    return false;
  }
};

export const getCurrentLanguage = () => currentLanguage;

export const changeLanguage = async (languageCode) => {
  return await saveLanguage(languageCode);
};

export const translate = (key, params = {}) => {
  try {
    const keys = key.split('.');
    let translation = translations[currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        translation = translations[DEFAULT_LANGUAGE];
        for (const k of keys) {
          if (translation && typeof translation === 'object' && translation[k] !== undefined) {
            translation = translation[k];
          } else {
            return key;
          }
        }
        break;
      }
    }

    if (typeof translation !== 'string') {
      return key;
    }

    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });

    return result;
  } catch (error) {
    return key;
  }
};

export const getAvailableLanguages = () => Object.values(AVAILABLE_LANGUAGES);

export const getLanguageInfo = (languageCode) => {
  return AVAILABLE_LANGUAGES[languageCode] || AVAILABLE_LANGUAGES[DEFAULT_LANGUAGE];
};

export const translateHabitName = (habit) => {
  if (!habit) return '';

  if (habit.translationKey) {
    const translated = translate(habit.translationKey);
    return translated !== habit.translationKey ? translated : habit.name;
  }

  const presetMappings = {
    'Water': 'habits.water',
    'Food': 'habits.food',
    'Walking': 'habits.walking',
    'Exercise': 'habits.exercise',
    'Reading': 'habits.reading',
    'Sleep': 'habits.sleep'
  };

  if (presetMappings[habit.name]) {
    const translated = translate(presetMappings[habit.name]);
    return translated !== presetMappings[habit.name] ? translated : habit.name;
  }

  const dynamicKey = `habits.${habit.name.toLowerCase()}`;
  const dynamicTranslated = translate(dynamicKey);
  if (dynamicTranslated !== dynamicKey) {
    return dynamicTranslated;
  }

  return habit.name;
};

export const translateUnit = (unit) => {
  if (!unit) return '';

  const normalizedUnit = unit.toLowerCase();
  const translated = translate(`units.${normalizedUnit}`);

  return translated !== `units.${normalizedUnit}` ? translated : unit;
};

export const translateDate = (date) => {
  if (!date) return '';

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  const dayName = translate(`history.days.${dayNames[date.getDay()]}`);
  const monthName = translate(`history.months.${monthNames[date.getMonth()]}`);
  const day = date.getDate();
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const useTranslation = () => {
  return {
    translate,
    translateHabitName,
    translateUnit,
    translateDate,
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    availableLanguages: getAvailableLanguages()
  };
};
