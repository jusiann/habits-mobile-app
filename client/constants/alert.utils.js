import { translate } from './language.utils';

export const ALERT_MESSAGES = {
  CONNECTION_ERROR: {
    title: () => translate('alerts.connectionError.title'),
    message: () => translate('alerts.connectionError.message')
  },
  NETWORK_ERROR: {
    title: () => translate('alerts.networkError.title'),
    message: () => translate('alerts.networkError.message')
  },
  VALIDATION_ERROR: {
    title: () => translate('alerts.validationError.title'),
    message: () => translate('alerts.validationError.message')
  },
  SUCCESS: {
    title: () => translate('alerts.success.title'),
    message: () => translate('alerts.success.message')
  },
  ERROR: {
    title: () => translate('alerts.error.title'),
    message: () => translate('alerts.error.message')
  }
};

export const getConnectionErrorAlert = () => ({
  type: 'error',
  title: ALERT_MESSAGES.CONNECTION_ERROR.title(),
  message: ALERT_MESSAGES.CONNECTION_ERROR.message(),
  buttons: [{ text: translate('common.ok'), style: 'default' }]
});

export const showConnectionError = (onPress = null) => {
  console.log('Connection Error:', ALERT_MESSAGES.CONNECTION_ERROR.message());
  if (onPress) onPress();
};


export const showNetworkError = (onPress = null) => {
  console.log('Network Error:', ALERT_MESSAGES.NETWORK_ERROR.message());
  if (onPress) onPress();
};


export const showCustomAlert = (title, message, buttons = [{ text: translate('common.ok') }]) => {
  console.log('Custom Alert:', title, message);
};

export const showSuccessAlert = (message = null, onPress = null) => {
  console.log('Success:', message || ALERT_MESSAGES.SUCCESS.message());
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