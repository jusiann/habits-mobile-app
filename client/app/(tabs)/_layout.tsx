import React from 'react';
import {View, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import COLORS from '../../constants/colors';

function TabIcon({ focused, iconName, title }: any) {
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
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="home-outline"
                title="Home"
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
            title: "History",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="time-outline"
                title="History"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="trophy-outline"
                title="Goals"
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
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconName="person-outline"
                title="Profile"
              />
            ),
          }}
        />
    </Tabs>
  );
}