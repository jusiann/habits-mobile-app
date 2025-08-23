import React from 'react'
import {Tabs} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                headerTitleStyle: {
                    color: COLORS.textPrimary,
                    fontWeight: '600'
                },
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    paddingTop: 5,
                    paddingBottom: insets.bottom,
                    height: 60 + insets.bottom,
                }
      }}
    >
        <Tabs.Screen name="index" 
            options={{ 
                title: 'Home',
                tabBarIcon: ({color,size}) => (<Ionicons name="home-outline" color={color} size={size} />)
            }}
        />
        <Tabs.Screen name="create" 
            options={{ 
                href: null
            }}
        />
        <Tabs.Screen name="detail" 
            options={{ 
                href: null
            }}
        />
        <Tabs.Screen name="history" 
            options={{ 
                title: 'History',
                tabBarIcon: ({color,size}) => (<Ionicons name="time-outline" color={color} size={size} />)
            }}
        />
        <Tabs.Screen name="challenge" 
            options={{ 
                title: 'Challenge',
                tabBarIcon: ({color,size}) => (<Ionicons name="trophy-outline" color={color} size={size} />)
            }}
        />
        <Tabs.Screen name="profile" 
            options={{ 
                title: 'Profile',
                tabBarIcon: ({color,size}) => (<Ionicons name="person-outline" color={color} size={size} />)
            }}
        />
        <Tabs.Screen name="update" 
            options={{ 
                href: null
            }}
        />
    </Tabs>
  )
}