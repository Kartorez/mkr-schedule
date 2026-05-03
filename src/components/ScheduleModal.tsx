import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ScheduleItem, ApiItem } from '../api';
import { useTheme } from '../hooks/useTheme';

interface ScheduleModalProps {
  item: ScheduleItem | null;
  isStudent: boolean;
  allTeachers: ApiItem[];
  onClose: () => void;
  parseApiDate: (dateStr: string) => Date;
}

function expandTeacherName(shortName: string, allTeachers: ApiItem[]) {
  if (!shortName) return shortName;
  const match = allTeachers.find((t) => {
    const shortParts = shortName.split(' ');
    if (shortParts.length < 2) return false;

    const lastName = shortParts[0];
    const initialsStr = shortParts[1];
    const [firstInit, patronymicInit] = initialsStr.split('.');

    const fullParts = t.name.replace(/\s+/g, ' ').split(' ');
    if (fullParts.length < 2) return false;

    if (fullParts[0] !== lastName) return false;
    if (firstInit && !fullParts[1]?.startsWith(firstInit)) return false;
    if (patronymicInit && !fullParts[2]?.startsWith(patronymicInit)) return false;

    return true;
  });
  return match ? match.name.replace(/\s+/g, ' ') : shortName;
}

function expandTeachersList(shortNamesStr: string, allTeachers: ApiItem[]) {
  if (!shortNamesStr) return shortNamesStr;
  return shortNamesStr
    .split(',')
    .map((name) => expandTeacherName(name.trim(), allTeachers))
    .join(', ');
}

export function ScheduleModal({
  item,
  isStudent,
  allTeachers,
  onClose,
  parseApiDate,
}: ScheduleModalProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  if (!item) return null;

  const isLecture = item.type.includes('lection');
  const isExam = item.type.includes('exam');
  const isCredit = item.type.includes('credit') || item.type.includes('absentia');

  let accentColor: string = colors.practice;
  let typeLabel = 'Практика';

  if (isLecture) {
    accentColor = colors.lecture;
    typeLabel = 'Лекція';
  } else if (isExam) {
    accentColor = colors.exam;
    typeLabel = 'Екзамен';
  } else if (isCredit) {
    accentColor = colors.credit;
    typeLabel = 'Залік';
  }

  const isUpdated = typeof item.updated === 'string';
  const isAdded = typeof item.added === 'string';

  if (isUpdated) {
    accentColor = '#ff9800';
    typeLabel = 'Змінено';
  }

  let teacherOrGroup = isStudent ? item.teacher : item.group;
  if (isStudent && teacherOrGroup) {
    teacherOrGroup = expandTeachersList(teacherOrGroup, allTeachers);
  }

  return (
    <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={[styles.modalContent, { borderLeftColor: accentColor }]} activeOpacity={1}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalTypeBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.modalTypeBadgeText}>{typeLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubject}>{item.name}</Text>

          <View style={styles.modalRow}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.modalText}>
              {format(parseApiDate(item.start), 'H:mm')} - {format(parseApiDate(item.end), 'H:mm')}
            </Text>
          </View>

          <View style={styles.modalRow}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.modalText}>{item.place}</Text>
          </View>

          <View style={styles.modalRow}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.modalText}>{teacherOrGroup}</Text>
          </View>

          {isUpdated ? (
            <View style={styles.modalRow}>
              <Ionicons name="alert-circle" size={20} color="#ff9800" />
              <Text style={[styles.modalText, { color: '#ff9800', fontWeight: '700' }]}>
                Оновлено: {format(new Date(item.updated as string), 'dd.MM.yyyy HH:mm')}
              </Text>
            </View>
          ) : isAdded ? (
            <View style={styles.modalRow}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.modalText, { color: colors.primary, fontWeight: '700' }]}>
                Додано: {format(new Date(item.added as string), 'dd.MM.yyyy HH:mm')}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      paddingLeft: 20,
      width: '100%',
      maxWidth: 400,
      borderLeftWidth: 6,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    modalTypeBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    modalSubject: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 24,
      lineHeight: 26,
    },
    modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    modalText: { fontSize: 15, color: colors.text, flex: 1, fontWeight: '500' },
  });
}
