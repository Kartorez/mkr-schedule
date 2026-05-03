import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { setupStore, SetupData } from '../store/setup';
import { usePreferences, ThemeType } from '../store/preferences';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function SettingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const styles = makeStyles(colors);

  const [setup, setSetup] = useState<SetupData | null>(null);

  const {
    theme,
    notificationsEnabled,
    scheduleChangesEnabled,
    setTheme,
    setNotificationsEnabled,
    setScheduleChangesEnabled,
  } = usePreferences();

  useEffect(() => {
    setupStore.load().then(setSetup);
  }, []);

  async function handleReset() {
    await setupStore.clear();
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{ name: 'RoleSelection' }],
    });
  }

  const isStudent = setup?.type === 'student';
  const profileName = isStudent ? setup?.group?.name : setup?.teacher?.name;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Налаштування</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ЗАГАЛЬНЕ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{isStudent ? 'Група' : 'Викладач'}</Text>
              <Text style={styles.rowSubtitle}>{profileName || 'Не обрано'}</Text>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Змінити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>СПОВІЩЕННЯ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Нагадування</Text>
              <Text style={styles.rowSubtitle}>За 10 хв до пари</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Зміни розкладу</Text>
              <Text style={styles.rowSubtitle}>Повідомляти про оновлення</Text>
            </View>
            <Switch
              value={scheduleChangesEnabled}
              onValueChange={setScheduleChangesEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ВИГЛЯД</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Тема</Text>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'auto'] as ThemeType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.themeOption, theme === t && styles.themeOptionActive]}
                onPress={() => setTheme(t)}
              >
                <View style={styles.themePreviewWrapper}>
                  {t === 'light' && (
                    <View style={[styles.themePreview, { backgroundColor: '#fff' }]} />
                  )}
                  {t === 'dark' && (
                    <View style={[styles.themePreview, { backgroundColor: '#1a1a1a' }]} />
                  )}
                  {t === 'auto' && (
                    <View style={[styles.themePreview, { flexDirection: 'row' }]}>
                      <View style={{ flex: 1, backgroundColor: '#fff' }} />
                      <View style={{ flex: 1, backgroundColor: '#1a1a1a' }} />
                    </View>
                  )}
                </View>
                <Text style={styles.themeLabel}>
                  {t === 'light' ? 'Світла' : t === 'dark' ? 'Темна' : 'Авто'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    header: { paddingTop: 60, paddingBottom: 24 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    section: { marginBottom: 32 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 10,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
    rowSubtitle: { fontSize: 13, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border, marginLeft: 16 },
    changeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
    },
    changeBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
    themeSelector: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 8,
      gap: 12,
    },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    themeOptionActive: {
      opacity: 1,
    },
    themePreviewWrapper: {
      width: '100%',
      aspectRatio: 1.2,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      overflow: 'hidden',
      padding: 4,
    },
    themePreview: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  });
}
