import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths, addMonths, addWeeks } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import { usePreferences } from '../store/preferences';
import { setupStore, SetupData } from '../store/setup';
import { useGroupSchedule, useTeacherSchedule, useAllTeachers } from '../api/queries';
import { ScheduleItem } from '../api';
import { ScheduleDay } from '../components/ScheduleDay';
import { ScheduleModal } from '../components/ScheduleModal';
import { requestNotificationPermissions, scheduleReminders } from '../utils/notifications';

export function HomeScreen() {
  const { notificationsEnabled } = usePreferences();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [setup, setSetup] = useState<SetupData | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() => addMonths(new Date(), 1));
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    setupStore.load().then(setSetup);
  }, []);

  const isStudent = setup?.type === 'student';
  const isTeacher = setup?.type === 'teacher';
  const dateFmt = 'yyyy-MM-dd';

  const groupQuery = useGroupSchedule(
    isStudent ? setup?.university?.id : undefined,
    isStudent ? setup?.faculty?.id : undefined,
    isStudent ? setup?.course?.id : undefined,
    isStudent ? setup?.group?.id : undefined,
    format(startDate, dateFmt),
    format(endDate, dateFmt),
  );

  const teacherQuery = useTeacherSchedule(
    isTeacher ? setup?.university?.id : undefined,
    isTeacher ? setup?.chair?.id : undefined,
    isTeacher ? setup?.teacher?.id : undefined,
    format(startDate, dateFmt),
    format(endDate, dateFmt),
  );

  const { data: allTeachers = [] } = useAllTeachers();
  const query = isStudent ? groupQuery : teacherQuery;
  const scheduleItems = query.data || [];
  const isLoading = query.isLoading || !setup;

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermissions().then((granted) => {
        if (granted && scheduleItems.length > 0) {
          scheduleReminders(scheduleItems);
        }
      });
    } else {
      import('expo-notifications').then((n) => n.cancelAllScheduledNotificationsAsync());
    }
  }, [scheduleItems, notificationsEnabled]);

  const parseApiDate = (dateStr: string) => {
    let isoStr = dateStr.replace(' ', 'T');
    if (isoStr.length === 16) isoStr += ':00';
    return new Date(isoStr);
  };

  const { groupedItems, actualRange } = useMemo(() => {
    if (scheduleItems.length === 0) return { groupedItems: [], actualRange: null };

    const sorted = [...scheduleItems].sort(
      (a, b) => parseApiDate(a.start).getTime() - parseApiDate(b.start).getTime(),
    );

    const groups: { date: Date; items: ScheduleItem[] }[] = [];
    sorted.forEach((item) => {
      const itemDate = parseApiDate(item.start);
      let group = groups.find(
        (g) =>
          g.date.getFullYear() === itemDate.getFullYear() &&
          g.date.getMonth() === itemDate.getMonth() &&
          g.date.getDate() === itemDate.getDate(),
      );
      if (!group) {
        group = { date: itemDate, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });

    return {
      groupedItems: groups,
      actualRange: {
        start: parseApiDate(sorted[0].start),
        end: parseApiDate(sorted[sorted.length - 1].end),
      },
    };
  }, [scheduleItems]);

  const hasMorePast = useMemo(() => {
    if (!actualRange || isLoading) return true;
    return actualRange.start.getTime() - startDate.getTime() < 1000 * 60 * 60 * 24 * 3;
  }, [actualRange, startDate, isLoading]);

  const hasMoreFuture = useMemo(() => {
    if (!actualRange || isLoading) return true;
    return endDate.getTime() - actualRange.end.getTime() < 1000 * 60 * 60 * 24 * 3;
  }, [actualRange, endDate, isLoading]);

  function loadPrevious() {
    if (!hasMorePast) return;
    setStartDate((prev) => subMonths(prev, 1));
  }

  function loadNext() {
    if (!hasMoreFuture) return;
    setEndDate((prev) => addMonths(prev, 1));
  }

  const title = isStudent ? setup?.group?.name : setup?.teacher?.name;
  const subtitle = isStudent ? setup?.university.name?.replace('BUZ', 'ВНАУ') : setup?.chair?.name;

  const displayPeriod = useMemo(() => {
    if (!actualRange) return `${format(startDate, 'dd.MM')} - ${format(endDate, 'dd.MM')}`;
    return `${format(actualRange.start, 'dd.MM')} - ${format(actualRange.end, 'dd.MM')}`;
  }, [actualRange, startDate, endDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Розклад</Text>
          <Text style={styles.headerSubtitle}>
            {title} · {subtitle}
          </Text>
          <Text style={styles.headerSubtitlePeriod}>Період: {displayPeriod}</Text>
          {query.isError ? (
            <Text style={[styles.headerSubtitlePeriod, { color: colors.error }]}>
              Офлайн (збережена копія)
            </Text>
          ) : query.dataUpdatedAt > 0 ? (
            <Text style={[styles.headerSubtitlePeriod, { color: colors.textSecondary }]}>
              Оновлено: {format(new Date(query.dataUpdatedAt), 'HH:mm')}
            </Text>
          ) : null}
        </View>
        <View style={styles.weekBadge}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.weekBadgeText}>Тиж {format(new Date(), 'w')}</Text>
        </View>
      </View>

      <FlatList
        data={groupedItems}
        keyExtractor={(item) => item.date.toISOString()}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && scheduleItems.length > 0}
            onRefresh={query.refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          hasMorePast && (!isLoading || scheduleItems.length > 0) ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadPrevious}>
              <Ionicons name="arrow-up" size={20} color={colors.textSecondary} />
              <Text style={styles.loadMoreText}>Завантажити попередній місяць</Text>
            </TouchableOpacity>
          ) : null
        }
        ListFooterComponent={
          hasMoreFuture && (!isLoading || scheduleItems.length > 0) ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadNext}>
              <Ionicons name="arrow-down" size={20} color={colors.textSecondary} />
              <Text style={styles.loadMoreText}>Завантажити наступний місяць</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            </View>
          ) : query.isError ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>Немає підключення до мережі</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>У цьому діапазоні немає пар</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ScheduleDay
            date={item.date}
            items={item.items}
            isStudent={isStudent}
            onItemPress={setSelectedItem}
            parseApiDate={parseApiDate}
          />
        )}
      />

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
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    headerText: { flex: 1, paddingRight: 16 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },
    headerSubtitlePeriod: { fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: '600' },
    weekBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    weekBadgeText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    content: { padding: 20, flexGrow: 1, paddingBottom: 40 },
    loadMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
      marginTop: 10,
    },
    loadMoreText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 16,
      fontWeight: '500',
    },
  });
}
