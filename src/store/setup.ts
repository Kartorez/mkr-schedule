import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiItem } from '../api';

const SETUP_KEY = '@mkr_schedule_setup';

export interface SetupData {
  type: 'student' | 'teacher';
  university: ApiItem;
  faculty?: ApiItem;
  course?: ApiItem;
  group?: ApiItem;
  chair?: ApiItem;
  teacher?: ApiItem;
  subjects?: string[];
}

export const setupStore = {
  async save(data: SetupData): Promise<void> {
    await AsyncStorage.setItem(SETUP_KEY, JSON.stringify(data));
  },

  async load(): Promise<SetupData | null> {
    const raw = await AsyncStorage.getItem(SETUP_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SetupData;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(SETUP_KEY);
  },
};
