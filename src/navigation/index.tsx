import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SetupDetailsScreen } from '../screens/SetupDetailsScreen';
import { StudentSetupScreen } from '../screens/StudentSetupScreen';
import { TeacherSetupScreen } from '../screens/TeacherSetupScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';
import { setupStore } from '../store/setup';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    setupStore.load().then((data) => {
      if (data) {
        setInitialRoute('MainTabs');
      } else {
        setInitialRoute('RoleSelection');
      }
    });
  }, []);

  if (initialRoute === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="RoleSelection" component={SetupDetailsScreen} />
        <Stack.Screen name="StudentSetup" component={StudentSetupScreen} />
        <Stack.Screen name="TeacherSetup" component={TeacherSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
