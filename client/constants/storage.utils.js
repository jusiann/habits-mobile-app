import AsyncStorage from "@react-native-async-storage/async-storage";
import {handleStorageError} from "./error.utils";

export class StorageUtils {
  static KEYS = {
    USER: "user",
    TOKEN: "token",
    REFRESH_TOKEN: "refreshToken",
    TOKEN_EXPIRATION: "tokenExpirationTime"
  };

  static async saveAuthData(user, accessToken, refreshToken) {
    try {
      const expirationTime = Date.now() + (15 * 60 * 1000);   
      await Promise.all([
        AsyncStorage.setItem(this.KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(this.KEYS.TOKEN, accessToken),
        AsyncStorage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(this.KEYS.TOKEN_EXPIRATION, expirationTime.toString())
      ]);
      
      return expirationTime;
    } catch (error) {
      handleStorageError("StorageUtils.saveAuthData", error, false);
      throw new Error("Failed to save authentication data");
    }
  }

  static async loadAuthData() {
    try {
      const [user, token, refreshToken, tokenExpirationTime] = await Promise.all([
        AsyncStorage.getItem(this.KEYS.USER),
        AsyncStorage.getItem(this.KEYS.TOKEN),
        AsyncStorage.getItem(this.KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(this.KEYS.TOKEN_EXPIRATION)
      ]);

      console.log('StorageUtils.loadAuthData - Raw values from AsyncStorage:', {
        user: user ? 'Available' : 'Not found',
        token: token ? 'Available' : 'Not found',
        refreshToken: refreshToken ? 'Available' : 'Not found',
        tokenExpirationTime: tokenExpirationTime ? tokenExpirationTime : 'Not found'
      });

      return {
        user: user ? JSON.parse(user) : null,
        token,
        refreshToken,
        tokenExpirationTime: tokenExpirationTime ? parseInt(tokenExpirationTime) : null
      };
    } catch (error) {
      console.error('StorageUtils.loadAuthData - Error:', error);
      handleStorageError("StorageUtils.loadAuthData", error, false);
      return {
        user: null,
        token: null,
        refreshToken: null,
        tokenExpirationTime: null
      };
    }
  }

  static async updateUser(user) {
    try {
      await AsyncStorage.setItem(this.KEYS.USER, JSON.stringify(user));
    } catch (error) {
      handleStorageError("StorageUtils.updateUser", error, false);
      throw new Error("Failed to update user data");
    }
  }

  static async updateTokens(accessToken, refreshToken) {
    try {
      const expirationTime = Date.now() + (15 * 60 * 1000); // 15 minutes
      
      await Promise.all([
        AsyncStorage.setItem(this.KEYS.TOKEN, accessToken),
        AsyncStorage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(this.KEYS.TOKEN_EXPIRATION, expirationTime.toString())
      ]);
      
      return expirationTime;
    } catch (error) {
      handleStorageError("StorageUtils.updateTokens", error, false);
      throw new Error("Failed to update tokens");
    }
  }

  static async clearAuthData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.KEYS.USER),
        AsyncStorage.removeItem(this.KEYS.TOKEN),
        AsyncStorage.removeItem(this.KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(this.KEYS.TOKEN_EXPIRATION)
      ]);
    } catch (error) {
      handleStorageError("StorageUtils.clearAuthData", error, false);
      throw new Error("Failed to clear authentication data");
    }
  }

  static async isAuthenticated() {
    try {
      const {token, tokenExpirationTime} = await this.loadAuthData();   
      if (!token || !tokenExpirationTime)
        return false;
      
      return Date.now() < tokenExpirationTime;
    } catch (error) {
      handleStorageError("StorageUtils.isAuthenticated", error, false);
      return false;
    }
  }

  static async getTokenRemainingTime() {
    try {
      const {tokenExpirationTime} = await this.loadAuthData();
      if (!tokenExpirationTime) 
        return 0;
      
      const remaining = tokenExpirationTime - Date.now();
      return Math.max(0, remaining);
    } catch (error) {
      handleStorageError("StorageUtils.getTokenRemainingTime", error, false);
      return 0;
    }
  }
}

export default StorageUtils;