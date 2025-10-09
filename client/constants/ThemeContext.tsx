import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, THEME_LOGOS } from './theme.utils';
import { themeManager } from './ThemeManager';

// Theme Context
const ThemeContext = createContext(null);

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('lightning');
  const [colors, setColors] = useState(THEMES.lightning.colors);

  // Kullanıcının seçili temasını yükle
  const loadUserTheme = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userTheme = user.theme || 'lightning';
        const themeColors = THEMES[userTheme].colors;
        
        setCurrentTheme(userTheme);
        setColors(themeColors);
        
        // Theme manager'ı da güncelle
        themeManager.setTheme(userTheme, themeColors);
      }
    } catch (error) {
      console.error('Error loading user theme:', error);
    }
  };

  const updateTheme = async (themeKey) => {
    setCurrentTheme(themeKey);
    const newColors = { ...THEMES[themeKey].colors };
    setColors(newColors);
    
    themeManager.setTheme(themeKey, newColors);
    
    try {
      const { updateColors } = await import('./colors');
      await updateColors();
    } catch (error) {
      console.error('Error updating global colors:', error);
    }
  };

  useEffect(() => {
    loadUserTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      colors,
      logo: THEME_LOGOS[currentTheme],
      updateTheme,
      loadUserTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;