import React from 'react';
import {Text, TouchableOpacity, View, Image} from 'react-native';
import {useRouter} from 'expo-router';
import styles from '../assets/styles/main.styles';
import SafeScreen from '../constants/SafeScreen';
import {translate} from '../constants/language.utils';

export default function Index() {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.card}>
        
          {/* LOGO SECTION */}
          <View style={styles.topIllustration}>
            <Image 
              source={require("../assets/images/logos/lightning-theme-logo.png")} 
              style={styles.illustrationImage}
            />
          </View>
        
          <View style={styles.header}>
            <Text style={styles.titleFirst}>{translate('welcome.title')}</Text>
            <Text style={styles.titleSecond}>{translate('welcome.appName')}</Text>
            <Text style={styles.subtitleSpaced}>
              {translate('welcome.subtitle')}
            </Text>
          </View>

          {/* BUTTON SECTION */}
          <View style={styles.formContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/(auth)')}
            >
              <Text style={styles.buttonText}>{translate('welcome.signIn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.buttonText}>{translate('welcome.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}
