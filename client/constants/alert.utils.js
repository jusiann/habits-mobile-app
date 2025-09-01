export const ALERT_MESSAGES = {
  CONNECTION_ERROR: {
    title: 'Connection Error',
    message: 'Failed to connect to server. Please check your internet connection and try again.'
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Network request failed. Please try again.'
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Please check your input and try again.'
  },
  SUCCESS: {
    title: 'Success',
    message: 'Operation completed successfully.'
  },
  ERROR: {
    title: 'Error',
    message: 'An error occurred. Please try again.'
  }
};

export const getConnectionErrorAlert = () => ({
  type: 'error',
  title: ALERT_MESSAGES.CONNECTION_ERROR.title,
  message: ALERT_MESSAGES.CONNECTION_ERROR.message,
  buttons: [{ text: 'OK', style: 'default' }]
});

export const showConnectionError = (onPress = null) => {
  console.log('Connection Error:', ALERT_MESSAGES.CONNECTION_ERROR.message);
  if (onPress) onPress();
};


export const showNetworkError = (onPress = null) => {
  console.log('Network Error:', ALERT_MESSAGES.NETWORK_ERROR.message);
  if (onPress) onPress();
};


export const showCustomAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  console.log('Custom Alert:', title, message);
};

export const showSuccessAlert = (message = null, onPress = null) => {
  console.log('Success:', message || ALERT_MESSAGES.SUCCESS.message);
  if (onPress) onPress();
};


export const showErrorAlert = (message = null, onPress = null) => {
  console.log('Error:', message || ALERT_MESSAGES.ERROR.message);
  if (onPress) onPress();
};

export default {
  ALERT_MESSAGES,
  showConnectionError,
  showNetworkError,
  showCustomAlert,
  showSuccessAlert,
  showErrorAlert
};