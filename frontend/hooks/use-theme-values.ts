'use client';

import { useTheme } from 'next-themes';
import { getTheme, type ThemeConfig, type ThemeMode } from '@/lib/theme';
import { useEffect, useState } from 'react';

/**
 * Hook to access theme values programmatically
 * 
 * @example
 * ```tsx
 * const { colors, spacing, isDark } = useThemeValues();
 * const primaryColor = colors.primary;
 * ```
 */
export function useThemeValues() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current theme mode
  const currentTheme: ThemeMode = mounted
    ? (theme === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : (theme as ThemeMode))
    : 'light';

  const themeConfig: ThemeConfig = getTheme(currentTheme);
  const isDark = currentTheme === 'dark';
  const isLight = currentTheme === 'light';

  return {
    ...themeConfig,
    mode: currentTheme,
    isDark,
    isLight,
    mounted,
  };
}

/**
 * Hook to get role-specific theme colors
 * 
 * @example
 * ```tsx
 * const adminColors = useRoleTheme('admin');
 * // Use adminColors.primary, adminColors.secondary, etc.
 * ```
 */
export function useRoleTheme(role: 'admin' | 'resident') {
  const { colors } = useThemeValues();
  
  return role === 'admin' ? colors.admin : colors.resident;
}

