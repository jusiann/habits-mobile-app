import {StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTheme} from './ThemeContext';

export default function SafeScreen({children}: {children: React.ReactNode}) {
  const insets = useSafeAreaInsets();
  const {colors: COLORS} = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
  });

  return (
    <View style={[styles.container, { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom, 
        paddingLeft: insets.left, 
        paddingRight: insets.right 
      }]}>
      {children}
    </View>
  );
}