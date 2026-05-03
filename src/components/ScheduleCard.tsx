import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ScheduleItem } from '../api';
import { useTheme } from '../hooks/useTheme';

interface ScheduleCardProps {
  item: ScheduleItem;
  isStudent: boolean;
  isToday: boolean;
  onPress: (item: ScheduleItem) => void;
  parseApiDate: (dateStr: string) => Date;
}

function getPairNumber(start: string) {
  switch (start) {
    case '8:00':
      return '1 пара';
    case '9:30':
      return '2 пара';
    case '11:30':
      return '3 пара';
    case '13:10':
      return '4 пара';
    case '14:40':
      return '5 пара';
    case '16:10':
      return '6 пара';
    case '17:40':
      return '7 пара';
    default:
      return null;
  }
}

export const ScheduleCard = memo(
  ({ item, isStudent, isToday, onPress, parseApiDate }: ScheduleCardProps) => {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const isLecture = item.type.includes('lection');
    const isExam = item.type.includes('exam');
    const isCredit = item.type.includes('credit') || item.type.includes('absentia');

    let accentColor: string = colors.practice;
    if (isLecture) accentColor = colors.lecture;
    if (isExam) accentColor = colors.exam;
    if (isCredit) accentColor = colors.credit;

    const isUpdated = typeof item.updated === 'string';
    const isAdded = typeof item.added === 'string';

    if (isUpdated) accentColor = '#ff9800';
    else if (isAdded) accentColor = colors.primary;

    const startTime = format(parseApiDate(item.start), 'H:mm');
    const endTime = format(parseApiDate(item.end), 'H:mm');
    const pairNumber = getPairNumber(startTime);

    return (
  <TouchableOpacity
    style={[styles.card, isToday && styles.cardToday, (isUpdated || isAdded) && { borderColor: accentColor }]}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <View style={styles.subjectContainer}>
          <View style={styles.badgesRow}>
            {pairNumber && <Text style={styles.pairNumber}>{pairNumber}</Text>}
            {isUpdated ? (
              <View style={styles.updatedBadge}>
                <Text style={styles.updatedBadgeText}>ЗМІНЕНО</Text>
              </View>
            ) : isAdded ? (
              <View style={[styles.updatedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.updatedBadgeText}>НОВЕ</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardSubject} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeTextStart}>{startTime}</Text>
          <Text style={styles.timeTextEnd}>{endTime}</Text>
        </View>
      </View>
      <Text style={styles.cardDetails}>
        {[item.place, isStudent ? item.teacher : item.group].filter(Boolean).join(' · ')}
      </Text>
    </View>
  </TouchableOpacity>
);
  },
);

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 10,
      overflow: 'hidden',
    },
    cardToday: {
      borderWidth: 1,
      borderColor: colors.lecture + '40',
    },
    cardAccent: { width: 4 },
    cardBody: { flex: 1, padding: 16, paddingRight: 20 },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    subjectContainer: { flex: 1, paddingRight: 16 },
    badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    pairNumber: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    updatedBadge: {
      backgroundColor: '#ff9800',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    updatedBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    cardSubject: { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 22 },
    timeBlock: { alignItems: 'flex-end' },
    timeTextStart: { fontSize: 14, fontWeight: '800', color: colors.text },
    timeTextEnd: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
    cardDetails: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  });
}
