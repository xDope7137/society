/**
 * Theme Usage Examples
 * 
 * This file demonstrates how to use the theme system in your components.
 * DO NOT import this file in production code - it's for reference only.
 */

import { useThemeValues, useRoleTheme } from '@/hooks/use-theme-values';
import { getTheme, themeUtils, type ThemeMode } from '@/lib/theme';

// Example 1: Using the hook in a component
export function ExampleComponent() {
  const { colors, spacing, isDark, mode } = useThemeValues();

  return (
    <div
      style={{
        backgroundColor: themeUtils.hsl(colors.background),
        color: themeUtils.hsl(colors.foreground),
        padding: spacing.lg,
      }}
    >
      <h1>Current theme: {mode}</h1>
      <p>Is dark mode: {isDark ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Example 2: Using role-specific colors
export function RoleBasedComponent({ role }: { role: 'admin' | 'resident' }) {
  const roleColors = useRoleTheme(role);

  return (
    <div
      className={`bg-gradient-to-r ${
        role === 'admin'
          ? 'from-indigo-600 to-purple-600'
          : 'from-blue-600 to-green-600'
      }`}
    >
      <p>Using {role} theme colors</p>
    </div>
  );
}

// Example 3: Using Tailwind classes with theme variables
export function TailwindThemeComponent() {
  return (
    <div className="bg-background text-foreground p-4 rounded-lg border border-border">
      <h2 className="text-primary">Primary Text</h2>
      <p className="text-muted-foreground">Muted Text</p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
        Primary Button
      </button>
      <div className="bg-success text-success-foreground mt-2 p-2 rounded">
        Success Message
      </div>
      <div className="bg-warning text-warning-foreground mt-2 p-2 rounded">
        Warning Message
      </div>
      <div className="bg-info text-info-foreground mt-2 p-2 rounded">
        Info Message
      </div>
    </div>
  );
}

// Example 4: Programmatic theme access
export function ProgrammaticThemeExample() {
  const lightTheme = getTheme('light');
  const darkTheme = getTheme('dark');

  // Access theme values programmatically
  const primaryColor = themeUtils.hsl(lightTheme.colors.primary);
  const spacingValue = themeUtils.spacing('lg', lightTheme);

  return (
    <div>
      <p>Light theme primary: {primaryColor}</p>
      <p>Spacing large: {spacingValue}</p>
    </div>
  );
}

// Example 5: Conditional styling based on theme
export function ConditionalThemeComponent() {
  const { isDark, colors } = useThemeValues();

  return (
    <div
      className={`p-4 rounded-lg ${
        isDark
          ? 'bg-gray-800 text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <p>This component adapts to the current theme</p>
    </div>
  );
}

