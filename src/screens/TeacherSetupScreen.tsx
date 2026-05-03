import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { BottomSheetPicker } from '../components/BottomSheetPicker';
import { RootStackParamList } from '../navigation/types';
import { ApiItem } from '../api';
import { useStructures, useChairs, useTeachers } from '../api/queries';
import { setupStore } from '../store/setup';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TeacherSetup'>;
type Field = 'university' | 'chair' | 'teacher';

export function TeacherSetupScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const styles = makeStyles(colors);

  const [university, setUniversity] = useState<ApiItem | null>(null);
  const [chair, setChair] = useState<ApiItem | null>(null);
  const [teacher, setTeacher] = useState<ApiItem | null>(null);

  const { data: structures, isLoading: isStructuresLoading } = useStructures();
  const { data: chairs, isLoading: isChairsLoading } = useChairs(university?.id);
  const { data: teachers, isLoading: isTeachersLoading } = useTeachers(university?.id, chair?.id);

  const [openField, setOpenField] = useState<Field | null>(null);

  const canProceed = university && chair && teacher;

  async function handleFinish() {
    if (!canProceed) return;
    await setupStore.save({
      type: 'teacher',
      university,
      chair,
      teacher,
    });
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{ name: 'MainTabs' }],
    });
  }

  function openPicker(field: Field) {
    setOpenField(field);
  }

  function handleSelect(field: Field, item: ApiItem) {
    if (field === 'university') {
      setUniversity(item);
      setChair(null);
      setTeacher(null);
    } else if (field === 'chair') {
      setChair(item);
      setTeacher(null);
    } else if (field === 'teacher') {
      setTeacher(item);
    }
  }

  const fields: {
    key: Field;
    label: string;
    placeholder: string;
    value: ApiItem | null;
    disabled: boolean;
  }[] = [
    {
      key: 'university',
      label: 'НАВЧАЛЬНИЙ ЗАКЛАД',
      placeholder: 'Оберіть заклад',
      value: university,
      disabled: false,
    },
    {
      key: 'chair',
      label: 'КАФЕДРА',
      placeholder: 'Оберіть кафедру',
      value: chair,
      disabled: !university,
    },
    {
      key: 'teacher',
      label: 'ВИКЛАДАЧ',
      placeholder: 'Знайдіть себе у списку',
      value: teacher,
      disabled: !chair,
    },
  ];

  function getItems(field: Field | null): ApiItem[] {
    if (field === 'university') return structures || [];
    if (field === 'chair') return chairs || [];
    if (field === 'teacher') return teachers || [];
    return [];
  }

  function getLoading(field: Field | null): boolean {
    if (field === 'university') return isStructuresLoading;
    if (field === 'chair') return isChairsLoading;
    if (field === 'teacher') return isTeachersLoading;
    return false;
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>МКР Розклад</Text>
          <Text style={styles.headerSubtitle}>Налаштуйте профіль викладача</Text>
        </View>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {fields.map((field) => (
          <View key={field.key} style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TouchableOpacity
              style={[styles.fieldInput, field.disabled && styles.fieldInputDisabled]}
              activeOpacity={field.disabled ? 1 : 0.7}
              onPress={() => !field.disabled && openPicker(field.key)}
            >
              <Text
                style={[
                  styles.fieldValue,
                  !field.value && styles.fieldPlaceholder,
                  field.disabled && styles.fieldValueDisabled,
                ]}
              >
                {field.value?.name ?? field.placeholder}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={field.disabled ? colors.textDisabled : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        ))}

        
        {teacher && (
          <View style={styles.teacherCard}>
            <View style={styles.teacherAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.teacherMeta}>{chair?.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setTeacher(null)}>
              <Ionicons name="close-circle" size={20} color={colors.textDisabled} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canProceed && styles.submitBtnDisabled]}
          activeOpacity={canProceed ? 0.85 : 1}
          disabled={!canProceed}
          onPress={handleFinish}
        >
          <Text style={styles.submitBtnText}>Почати</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetPicker
        visible={openField !== null}
        title={fields.find((f) => f.key === openField)?.label ?? ''}
        items={getItems(openField)}
        loading={getLoading(openField)}
        onSelect={(item) => openField && handleSelect(openField, item)}
        onClose={() => setOpenField(null)}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 24,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    form: { flex: 1, paddingHorizontal: 20 },
    fieldBlock: { marginBottom: 20 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    fieldInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    fieldInputDisabled: { backgroundColor: colors.surfaceSecondary, opacity: 0.6 },
    fieldValue: { fontSize: 15, color: colors.text, flex: 1 },
    fieldPlaceholder: { color: colors.textDisabled },
    fieldValueDisabled: { color: colors.textDisabled },
    teacherCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary + '44',
      borderRadius: 12,
      padding: 14,
      marginTop: 4,
    },
    teacherAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    teacherInfo: { flex: 1 },
    teacherName: { fontSize: 15, fontWeight: '600', color: colors.text },
    teacherMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12 },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.45 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
}
