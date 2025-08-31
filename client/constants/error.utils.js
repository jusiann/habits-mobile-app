import {showConnectionError, showErrorAlert, showNetworkError} from "./alert.utils";

export class ErrorHandler {
  static logError(context, error, additionalInfo = {}) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error.message,
      stack: error.stack,
      ...additionalInfo
    };
    console.error(`[${context}] Error:`, errorInfo);
  };

  static handleNetworkError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'network' });
    
    if (showAlert) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed") || error.message.includes("fetch"))
        showConnectionError();
      else
        showNetworkError();
    }
  };

  static handleApiError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'api' });
    
    if (showAlert) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed"))
        showConnectionError();
      else
        showErrorAlert("API Error", error.message);
    }
  };

  static handleAuthError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'auth' });
    
    if (showAlert) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed"))
        showConnectionError();
      else if (error.message.includes("401") ||  error.message.includes("Unauthorized") || error.message.includes("Invalid token"))
        showErrorAlert("Authentication Failed", "Please log in again.");
      else
        showErrorAlert("Authentication Error", error.message);
    }
  };

  static handleValidationError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'validation' });
    if (showAlert)
      showErrorAlert("Validation Error", error.message);
  };

  static handleStorageError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'storage' });
    if (showAlert)
      showErrorAlert("Storage Error", "Failed to save data locally.");
  };

  static handleParseError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'parse' });
    if (showAlert)
      showErrorAlert("Data Error", "Invalid server response format.");
  };

  static handleGenericError(context, error, showAlert = true) {
    this.logError(context, error, { type: 'generic' });
    if (showAlert) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) 
        showConnectionError();
      else
        showErrorAlert("Error", error.message || "An unexpected error occurred.");
    }
  };

  static async withErrorHandling(context, asyncFunction, errorHandler = null) {
    try {
      return await asyncFunction();
    } catch (error) {
      if (errorHandler)
        errorHandler(context, error);
      else
        this.handleGenericError(context, error);
      throw error;
    }
  };

  static withSyncErrorHandling(context, syncFunction, errorHandler = null) {
    try {
      return syncFunction();
    } catch (error) {
      if (errorHandler)
        errorHandler(context, error);
      else
        this.handleGenericError(context, error);
      throw error;
    }
  };

  static createError(message, context, originalError = null) {
    const error = new Error(message);
    error.context = context;
    error.originalError = originalError;
    return error;
  };

  static isNetworkError(error) {
    return error.message.includes("Failed to fetch") ||
           error.message.includes("Network request failed") ||
           error.message.includes("fetch") ||
           error.name === "NetworkError";
  };

  static isAuthError(error) {
    return error.message.includes("401") ||
           error.message.includes("Unauthorized") ||
           error.message.includes("Invalid token") ||
           error.message.includes("Authentication failed");
  };

  static isValidationError(error) {
    return error.message.includes("validation") ||
           error.message.includes("required") ||
           error.message.includes("invalid") ||
           error.status === 400;
  };
};

export const logError = (context, error, additionalInfo) => 
  ErrorHandler.logError(context, error, additionalInfo);

export const handleNetworkError = (context, error, showAlert = true) => 
  ErrorHandler.handleNetworkError(context, error, showAlert);

export const handleApiError = (context, error, showAlert = true) => 
  ErrorHandler.handleApiError(context, error, showAlert);

export const handleAuthError = (context, error, showAlert = true) => 
  ErrorHandler.handleAuthError(context, error, showAlert);

export const handleValidationError = (context, error, showAlert = true) => 
  ErrorHandler.handleValidationError(context, error, showAlert);

export const handleStorageError = (context, error, showAlert = true) => 
  ErrorHandler.handleStorageError(context, error, showAlert);

export const handleParseError = (context, error, showAlert = true) => 
  ErrorHandler.handleParseError(context, error, showAlert);

export const handleGenericError = (context, error, showAlert = true) => 
  ErrorHandler.handleGenericError(context, error, showAlert);

export const withErrorHandling = (context, asyncFunction, errorHandler) => 
  ErrorHandler.withErrorHandling(context, asyncFunction, errorHandler);

export const withSyncErrorHandling = (context, syncFunction, errorHandler) => 
  ErrorHandler.withSyncErrorHandling(context, syncFunction, errorHandler);

export default ErrorHandler;