import { useColorScheme as useSystemColorScheme } from 'react-native';
import { lightColors, darkColors } from '../constants/colors';
import { usePreferences } from '../store/preferences';

export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const themePref = usePreferences((state) => state.theme);

  const isDark = themePref === 'dark' || (themePref === 'auto' && systemColorScheme === 'dark');

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    theme: isDark ? 'dark' : 'light',
  };
}
