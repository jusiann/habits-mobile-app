import { THEMES, getThemeColors } from './theme.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeManager } from './ThemeManager';


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

const createDynamicColors = () => {
  let currentColors = { ...THEMES.lightning.colors };
  
  themeManager.on('themeChanged', ({ colors }) => {
    currentColors = { ...colors };
  });

  return new Proxy(currentColors, {
    get(target, prop) {
      const managerColors = themeManager.getCurrentColors();
      if (managerColors && managerColors[prop]) {
        return managerColors[prop];
      }
      return target[prop];
    }
  });
};


export const updateColors = async () => {
  try {
    const userTheme = await getUserTheme();
    const themeColors = getThemeColors(userTheme);
    
    
    themeManager.setTheme(userTheme, themeColors);
    
    return themeColors;
  } catch (error) {
    console.error('Error updating colors:', error);
    return THEMES.lightning.colors;
  }
};


const COLORS = createDynamicColors();


updateColors();

export default COLORS;