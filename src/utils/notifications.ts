import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ScheduleItem } from '../api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Нагадування про пари',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#34D399',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleReminders(scheduleItems: ScheduleItem[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  for (const item of scheduleItems) {
    let isoStr = item.start.replace(' ', 'T');
    if (isoStr.length === 16) isoStr += ':00';
    const startDate = new Date(isoStr);

    const reminderTime = new Date(startDate.getTime() - 10 * 60 * 1000);

    if (reminderTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Скоро почнеться пара! ⏰`,
          body: `${item.name} почнеться через 10 хвилин в ${item.place}`,
          sound: true,
        },
        trigger: reminderTime,
      });
    }
  }
}
