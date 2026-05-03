import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation';
import { usePreferences } from './src/store/preferences';
import { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync } from './src/utils/backgroundTask';

const queryClient = new QueryClient();

export default function App() {
  const colorScheme = useColorScheme();
  const { scheduleChangesEnabled } = usePreferences();

  useEffect(() => {
    if (scheduleChangesEnabled) {
      registerBackgroundFetchAsync().catch(console.error);
    } else {
      unregisterBackgroundFetchAsync().catch(console.error);
    }
  }, [scheduleChangesEnabled]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </QueryClientProvider>
  );
}
