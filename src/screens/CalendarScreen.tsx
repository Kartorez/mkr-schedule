import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { format, startOfMonth, endOfMonth, parseISO, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useTheme } from '../hooks/useTheme';
import { usePreferences } from '../store/preferences';
import { setupStore, SetupData } from '../store/setup';
import { useGroupSchedule, useTeacherSchedule, useAllTeachers } from '../api/queries';
import { ScheduleCard } from '../components/ScheduleCard';
import { ScheduleModal } from '../components/ScheduleModal';
import { ScheduleItem } from '../api';

LocaleConfig.locales['uk'] = {
  monthNames: [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
  ],
  monthNamesShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
  dayNames: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота'],
  dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сьогодні',
};
LocaleConfig.defaultLocale = 'uk';

export function CalendarScreen() {
  const { colors } = useTheme();
  const { theme } = usePreferences();
  const styles = makeStyles(colors);

  const [setup, setSetup] = useState<SetupData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    setupStore.load().then(setSetup);
  }, []);

  const isStudent = setup?.type === 'student';
  const isTeacher = setup?.type === 'teacher';

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const groupQuery = useGroupSchedule(
    isStudent ? setup?.university?.id : undefined,
    isStudent ? setup?.faculty?.id : undefined,
    isStudent ? setup?.course?.id : undefined,
    isStudent ? setup?.group?.id : undefined,
    startDate,
    endDate,
  );

  const teacherQuery = useTeacherSchedule(
    isTeacher ? setup?.university?.id : undefined,
    isTeacher ? setup?.chair?.id : undefined,
    isTeacher ? setup?.teacher?.id : undefined,
    startDate,
    endDate,
  );

  const { data: allTeachers = [] } = useAllTeachers();

  const query = isStudent ? groupQuery : teacherQuery;
  const scheduleItems = query.data || [];
  const isLoading = query.isLoading || !setup;

  const parseApiDate = (dateStr: string) => {
    let isoStr = dateStr.replace(' ', 'T');
    if (isoStr.length === 16) isoStr += ':00';
    return new Date(isoStr);
  };

  const itemsByDate = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    scheduleItems.forEach((item) => {
      const d = parseApiDate(item.start);
      const key = format(d, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [scheduleItems]);

  const selectedDayItems = itemsByDate[selectedDate] || [];
  selectedDayItems.sort((a, b) => parseApiDate(a.start).getTime() - parseApiDate(b.start).getTime());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Календар</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            onMonthChange={(month: DateData) => setCurrentMonth(new Date(month.timestamp))}
            firstDay={1}
            theme={{
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              dayTextColor: colors.text,
              todayTextColor: colors.primary,
              monthTextColor: colors.text,
              arrowColor: colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
            dayComponent={(props: any) => {
              const { date, state } = props;
              if (!date) return <View style={styles.dayCell} />;

              const itemsCount = itemsByDate[date.dateString]?.length || 0;
              const isSelected = date.dateString === selectedDate;
              const isToday = state === 'today';
              const isDisabled = state === 'disabled';

              return (
                <TouchableOpacity
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDate(date.dateString)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isDisabled && styles.dayTextDisabled,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {date.day}
                  </Text>
                  {itemsCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{itemsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.scheduleList}>
          <Text style={styles.listTitle}>
            Розклад на {format(new Date(selectedDate), 'd MMMM', { locale: uk })}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : selectedDayItems.length > 0 ? (
            selectedDayItems.map((item, index) => (
              <ScheduleCard
                key={`${item.start}-${index}`}
                item={item}
                isStudent={isStudent}
                isToday={isSameDay(new Date(selectedDate), new Date())}
                onPress={setSelectedItem}
                parseApiDate={parseApiDate}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Пар немає 🎉</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ScheduleModal
        item={selectedItem}
        isStudent={isStudent}
        allTeachers={allTeachers}
        onClose={() => setSelectedItem(null)}
        parseApiDate={parseApiDate}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    calendarContainer: {
      backgroundColor: colors.surface,
      paddingBottom: 16,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    dayCell: {
      width: 38,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    dayCellSelected: {
      backgroundColor: '#2D6A4F',
    },
    dayCellToday: {
      backgroundColor: '#E8F5E9',
    },
    dayText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    dayTextDisabled: {
      color: colors.textDisabled,
    },
    dayTextSelected: {
      color: '#fff',
      fontWeight: '700',
    },
    dayTextToday: {
      color: '#2D6A4F',
      fontWeight: '700',
    },
    badge: {
      position: 'absolute',
      bottom: 2,
      backgroundColor: '#ff9800',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    badgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    scheduleList: {
      padding: 20,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });
}
