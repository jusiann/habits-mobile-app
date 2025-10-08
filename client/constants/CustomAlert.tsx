import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from './ThemeContext';

const {width} = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onDismiss?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => onDismiss?.(), style: 'default' }],
  onDismiss,
}) => {
  const {colors: COLORS} = useTheme();
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FFC107';
      default:
        return '#2196F3';
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertContainer: {
      backgroundColor: COLORS.white,
      borderRadius: 20,
      padding: 20,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    iconContainer: {
      marginBottom: 15,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: COLORS.textDark,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    buttonColumnContainer: {
      flexDirection: 'column',
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
    },
    destructiveButton: {
      backgroundColor: '#F44336',
    },
    cancelButton: {
      backgroundColor: '#E0E0E0',
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },
    destructiveButtonText: {
      color: COLORS.white,
    },
    cancelButtonText: {
      color: COLORS.textDark,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIconName()} size={40} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={[styles.buttonContainer, buttons.length > 2 && styles.buttonColumnContainer]}>
            {
              buttons.map((button, index) => (
                <TouchableOpacity key={index} style={[
                    styles.button,
                    button.style === 'destructive' && styles.destructiveButton,
                    button.style === 'cancel' && styles.cancelButton,
                    buttons.length === 2 && { flex: 1 },
                    index > 0 && buttons.length === 2 && { marginLeft: 8 },
                    index > 0 && buttons.length > 2 && { marginTop: 8 },
                  ]}
                onPress={() => {
                  if (button.onPress && typeof button.onPress === 'function') {
                    button.onPress();
                  } else if (onDismiss && typeof onDismiss === 'function') {
                    onDismiss();
                  }
                }}
                >
                  <Text style={[
                      styles.buttonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;