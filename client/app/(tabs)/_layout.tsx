import React from 'react';
import {View, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {translate} from '../../constants/language.utils';
import {useTheme} from '../../constants/ThemeContext';

function TabIcon({ focused, iconName, title }: any) {
  const {colors: COLORS} = useTheme();
  
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: focused ? COLORS.primary : 'transparent',
      height: 50,
      width: focused ? 110 : 50,
      borderRadius: 25,
    }}>
      <View style={{ height: 30, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons 
          name={iconName} 
          size={24} 
          color={focused ? COLORS.white : COLORS.textSecondary} 
        />
      </View>
      {focused && (
        <Text style={{
          color: COLORS.white,
          fontSize: 12,
          fontWeight: "600",
          marginTop: 0
        }}>
          {title}
        </Text>
      )}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const {colors: COLORS} = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShadowVisible: false,
        tabBarStyle: {
            backgroundColor: COLORS.background,
            borderRadius: 25,
            marginHorizontal: 20,
            marginBottom: 20,
            paddingHorizontal: 10,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: COLORS.black,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            paddingBottom: 13 + insets.bottom,
            height: 50,
          }
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            title: translate('navigation.home'),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="home-outline"
                title={translate('navigation.home')}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create.habit"
          options={{
            href: null
          }}
        />
        <Tabs.Screen
          name="detail"
          options={{
            href: null
          }}
        />
        <Tabs.Screen
          name="update"
          options={{
            href: null
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: translate('navigation.history'),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="time-outline"
                title={translate('navigation.history')}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: translate('navigation.goals'),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="trophy-outline"
                title={translate('navigation.goals')}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create.goal"
          options={{
            href: null
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: translate('navigation.profile'),
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="person-outline"
                title={translate('navigation.profile')}
              />
            ),
          }}
        />
    </Tabs>
  );
}
