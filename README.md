# MKR Schedule 📱

Це пет-проєкт для перегляду розкладу занять, побудований на **React Native** та **Expo**. Додаток дозволяє зручно відстежувати заняття, отримувати сповіщення та працювати в офлайн-режимі.

## Особливості

- **Перегляд розкладу**: Зручний календар та список занять.
- **Сповіщення**: Локальні пуш-повідомлення про початок пар.
- **Фонове оновлення**: Автоматична синхронізація розкладу у фоновому режимі.
- **Офлайн доступ**: Збереження даних за допомогою AsyncStorage для роботи без інтернету.
- **Сучасний інтерфейс**: Побудований з використанням React Navigation та кастомних компонентів.

## Технологічний стек

- **Framework**: [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Styling**: Native Components & StyleSheet
- **Notifications**: `expo-notifications` & `expo-background-fetch`

##  Як запустити проєкт

1. **Клонуйте репозиторій**:
   ```bash
   git clone <url-репозиторію>
   cd mkr-schedule
   ```

2. **Встановіть залежності**:
   ```bash
   npm install
   ```

3. **Запустіть додаток**:
   ```bash
   npm start
   ```

Використовуйте додаток **Expo Go** на своєму смартфоні або запустіть емулятор через меню Expo.

