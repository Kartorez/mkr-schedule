import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;

export const SetupDetailsScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const styles = makeStyles(colors);

  const [selectedRole, setSelectedRole] = useState<string | null>('student');

  const roles = [
    {
      id: 'student',
      title: 'Студент',
      desc: 'Оберіть свою групу щоб бачити розклад',
      icon: 'school' as const,
      bgColor: '#E8F5E9',
    },
    {
      id: 'teacher',
      title: 'Викладач',
      desc: 'Оберіть предмети та групи, які ви викладаєте',
      icon: 'person' as const,
      bgColor: '#E3F2FD',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Хто ти?</Text>
        <Text style={styles.subtitle}>Оберіть роль для персоналізації розкладу</Text>
        <View style={styles.selectCards}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(role.id)}
                style={[styles.card, isSelected ? styles.selectedCard : styles.unselectedCard]}
              >
                <View style={[styles.iconContainer, { backgroundColor: role.bgColor }]}>
                  <Ionicons name={role.icon} size={30} color={isSelected ? '#2D6A4F' : '#555'} />
                </View>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardDesc}>{role.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => {
            if (selectedRole === 'student') navigation.navigate('StudentSetup');
            else if (selectedRole === 'teacher') navigation.navigate('TeacherSetup');
          }}
        >
          <Text style={styles.roleButtonText}>Далі</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    content: {},
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 20,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    selectCards: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    card: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
      borderRadius: 12,
      padding: 20,
      borderWidth: 2,
    },
    unselectedCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    selectedCard: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.primary,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      textAlign: 'center',
    },
    roleButton: {
      marginTop: 24,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    roleButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
