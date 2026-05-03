import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { setupStore } from '../store/setup';
import { api } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCHEDULE_FETCH_TASK = 'BACKGROUND_SCHEDULE_FETCH_TASK';

TaskManager.defineTask(SCHEDULE_FETCH_TASK, async () => {
  try {
    const setup = await setupStore.load();
    if (!setup) return BackgroundFetch.BackgroundFetchResult.NoData;

    const isStudent = setup.type === 'student';
    const profileId = isStudent ? setup.group?.id : setup.teacher?.id;
    if (!profileId || !setup.university.id) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { university, faculty, course, chair } = setup;
    let schedule = [];

    const startStr = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + 14);
    const endStr = end.toISOString().split('T')[0];

    if (isStudent && faculty && course) {
      schedule = await api.groupSchedule(university.id, faculty.id, course.id, profileId, startStr, endStr);
    } else if (!isStudent && chair) {
      schedule = await api.teacherSchedule(university.id, chair.id, profileId, startStr, endStr);
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const CACHE_KEY = '@mkr_schedule_last_fetch';
    const rawCache = await AsyncStorage.getItem(CACHE_KEY);
    const prevSchedule = rawCache ? JSON.parse(rawCache) : null;

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(schedule));

    if (prevSchedule) {
      const prevUpdatedTimes = prevSchedule.map((i: any) => i.updated).join(',');
      const prevAddedTimes = prevSchedule.map((i: any) => i.added).join(',');

      const newUpdatedTimes = schedule.map((i: any) => i.updated).join(',');
      const newAddedTimes = schedule.map((i: any) => i.added).join(',');

      const hasChanges = prevUpdatedTimes !== newUpdatedTimes || prevAddedTimes !== newAddedTimes || prevSchedule.length !== schedule.length;

      if (hasChanges) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Розклад оновлено! 🔄',
            body: 'У вашому розкладі відбулися зміни.',
            sound: true,
          },
          trigger: null,
        });
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(SCHEDULE_FETCH_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(SCHEDULE_FETCH_TASK);
}
