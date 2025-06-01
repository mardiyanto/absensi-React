import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TouchableOpacity, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          drawerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          drawerActiveTintColor: '#007bff',
          drawerInactiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          drawerLabelStyle: {
            marginLeft: -20,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Menu Utama',
            drawerLabel: 'Menu Utama',
            drawerIcon: ({ color }) => (
              <IconSymbol name="house.fill" size={24} color={color} />
            ),
          }}
        />
        
        <Drawer.Screen
          name="+not-found"
          options={{
            title: 'Not Found',
            drawerLabel: 'Not Found',
            drawerIcon: ({ color }) => (
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="page"
          options={{
            title: 'Page',
            drawerLabel: 'Page',
            drawerIcon: ({ color }) => (
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color={color} />
            ),
          }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
