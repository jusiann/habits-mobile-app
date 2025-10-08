// Basit EventEmitter alternatifi React Native için
class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }

  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }
}

class ThemeManager extends SimpleEventEmitter {
  constructor() {
    super();
    this.currentTheme = 'lightning';
    this.currentColors = null;
  }

  setTheme(themeKey, colors) {
    this.currentTheme = themeKey;
    this.currentColors = colors;
    this.emit('themeChanged', { theme: themeKey, colors });
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getCurrentColors() {
    return this.currentColors;
  }
}

export const themeManager = new ThemeManager();
export default themeManager;