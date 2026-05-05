import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootNavigator } from './src/navigation';
import { usePreferences } from './src/store/preferences';
import { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync } from './src/utils/backgroundTask';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 3000,
});

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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <RootNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </PersistQueryClientProvider>
  );
}
