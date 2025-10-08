import { THEMES, getThemeColors } from './theme.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeManager } from './ThemeManager';

// Kullanıcının temayını al
const getUserTheme = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.theme || 'lightning';
    }
    return 'lightning';
  } catch (error) {
    console.error('Error getting user theme:', error);
    return 'lightning';
  }
};

// Dinamik colors proxy
const createDynamicColors = () => {
  let currentColors = THEMES.lightning.colors;
  
  // Theme manager'dan güncellemeleri dinle
  themeManager.on('themeChanged', ({ colors }) => {
    Object.keys(colors).forEach(key => {
      currentColors[key] = colors[key];
    });
  });

  return new Proxy(currentColors, {
    get(target, prop) {
      // Her erişimde güncel renkleri döndür
      const managerColors = themeManager.getCurrentColors();
      if (managerColors && managerColors[prop]) {
        return managerColors[prop];
      }
      return target[prop];
    }
  });
};

// Temayı güncelle
export const updateColors = async () => {
  try {
    const userTheme = await getUserTheme();
    const themeColors = getThemeColors(userTheme);
    
    // Theme manager'ı güncelle
    themeManager.setTheme(userTheme, themeColors);
    
    return themeColors;
  } catch (error) {
    console.error('Error updating colors:', error);
    return THEMES.lightning.colors;
  }
};

// Dinamik colors objesi oluştur
const COLORS = createDynamicColors();

// Uygulama başlangıcında temayı yükle
updateColors();

export default COLORS;