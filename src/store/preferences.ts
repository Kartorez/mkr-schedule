import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'auto';

interface PreferencesState {
  theme: ThemeType;
  notificationsEnabled: boolean;
  scheduleChangesEnabled: boolean;
  setTheme: (theme: ThemeType) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setScheduleChangesEnabled: (enabled: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'auto',
      notificationsEnabled: true,
      scheduleChangesEnabled: false,
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setScheduleChangesEnabled: (enabled) => set({ scheduleChangesEnabled: enabled }),
    }),
    {
      name: 'mkr-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
