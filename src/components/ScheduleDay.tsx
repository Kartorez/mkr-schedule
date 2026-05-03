import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ScheduleItem } from '../api';
import { useTheme } from '../hooks/useTheme';
import { ScheduleCard } from './ScheduleCard';

interface ScheduleDayProps {
  date: Date;
  items: ScheduleItem[];
  isStudent: boolean;
  onItemPress: (item: ScheduleItem) => void;
  parseApiDate: (dateStr: string) => Date;
}

export const ScheduleDay = memo(
  ({ date, items, isStudent, onItemPress, parseApiDate }: ScheduleDayProps) => {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const isTodayDate = isSameDay(date, new Date());

    return (
      <View style={styles.dayGroup}>
        <Text style={[styles.dayTitle, isTodayDate && styles.dayTitleToday]}>
          {isTodayDate && 'СЬОГОДНІ · '}
          {format(date, 'EE · d MMM', { locale: uk }).toUpperCase()}
        </Text>

        {items.map((item, index) => (
          <ScheduleCard
            key={`${item.start}-${index}`}
            item={item}
            isStudent={isStudent}
            isToday={isTodayDate}
            onPress={onItemPress}
            parseApiDate={parseApiDate}
          />
        ))}
      </View>
    );
  },
);

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    dayGroup: { marginBottom: 24 },
    dayTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 1,
      marginBottom: 12,
      textAlign: 'center',
    },
    dayTitleToday: {
      color: colors.lecture,
    },
  });
}
