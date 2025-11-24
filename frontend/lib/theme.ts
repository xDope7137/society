/**
 * Global Theme Configuration
 * 
 * Centralized theme values for light and dark modes.
 * All values are defined in HSL format for consistency with CSS variables.
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Card colors
  card: string;
  cardForeground: string;
  
  // Popover colors
  popover: string;
  popoverForeground: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Destructive colors
  destructive: string;
  destructiveForeground: string;
  
  // Border and input colors
  border: string;
  input: string;
  ring: string;
  
  // Additional semantic colors
  success?: string;
  successForeground?: string;
  warning?: string;
  warningForeground?: string;
  info?: string;
  infoForeground?: string;
  
  // Role-specific colors (for admin/resident themes)
  admin?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  resident?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  radius: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  cards: {
    base: string;
    rounded: string;
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
    border: {
      width: string;
      opacity: string;
    };
    backdrop: {
      blur: string;
      opacity: string;
    };
  };
}

/**
 * Light Theme Configuration
 */
export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    
    primary: '217 91% 60%', // Blue-400 from apartments dashboard
    primaryForeground: '0 0% 100%',
    
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    
    accent: '280 100% 70%', // Purple-400 from apartments dashboard
    accentForeground: '0 0% 100%',
    
    destructive: '0 70% 55%', // Rose-500 from apartments dashboard
    destructiveForeground: '0 0% 100%',
    
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '217 91% 60%', // Blue-400
    
    success: '142 70% 45%', // Emerald-500 from apartments dashboard
    successForeground: '0 0% 100%',
    
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    
    info: '217 91% 60%', // Blue-400
    infoForeground: '0 0% 100%',
    
    // Admin theme colors (indigo/purple) - matching apartments dashboard
    admin: {
      primary: '217 91% 60%', // Blue-400
      secondary: '280 100% 70%', // Purple-400
      accent: '217 91% 50%', // Blue-500
    },
    
    // Resident theme colors (blue/green) - matching apartments dashboard
    resident: {
      primary: '217 91% 60%', // Blue-400
      secondary: '142 70% 45%', // Emerald-500
      accent: '142 70% 50%', // Emerald-400
    },
  },
  radius: '0.5rem',
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, Monaco, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  cards: {
    base: 'relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-card-border/50 shadow-xl transition-all duration-300',
    rounded: 'rounded-xl',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    border: {
      width: 'border',
      opacity: 'border-opacity-50',
    },
    backdrop: {
      blur: 'backdrop-blur-sm',
      opacity: 'bg-opacity-80',
    },
  },
};

/**
 * Dark Theme Configuration
 */
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    
    primary: '217 91% 60%', // Blue-400 from apartments dashboard
    primaryForeground: '0 0% 100%',
    
    secondary: '217.2 32.6% 25%', // gray-700
    secondaryForeground: '210 40% 98%',
    
    muted: '217.2 32.6% 35%', // gray-600
    mutedForeground: '215 20.2% 65.1%',
    
    accent: '280 100% 70%', // Purple-400 from apartments dashboard
    accentForeground: '0 0% 100%',
    
    destructive: '0 70% 55%', // Rose-500 from apartments dashboard
    destructiveForeground: '0 0% 100%',
    
    border: '217.2 32.6% 25%', // gray-700
    input: '217.2 32.6% 35%', // gray-600
    ring: '217 91% 60%', // Blue-400
    
    success: '142 70% 45%', // Emerald-500 from apartments dashboard
    successForeground: '0 0% 100%',
    
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    
    info: '217 91% 60%', // Blue-400
    infoForeground: '0 0% 100%',
    
    // Admin theme colors (indigo/purple) - matching apartments dashboard
    admin: {
      primary: '217 91% 60%', // Blue-400
      secondary: '280 100% 70%', // Purple-400
      accent: '217 91% 50%', // Blue-500
    },
    
    // Resident theme colors (blue/green) - matching apartments dashboard
    resident: {
      primary: '217 91% 60%', // Blue-400
      secondary: '142 70% 45%', // Emerald-500
      accent: '142 70% 50%', // Emerald-400
    },
  },
  radius: '0.5rem',
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, Monaco, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  },
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  cards: {
    base: 'relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-card-border/50 shadow-xl transition-all duration-300',
    rounded: 'rounded-xl',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    border: {
      width: 'border',
      opacity: 'border-opacity-50',
    },
    backdrop: {
      blur: 'backdrop-blur-sm',
      opacity: 'bg-opacity-80',
    },
  },
};

/**
 * Get theme configuration by mode
 */
export function getTheme(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Get color value as HSL string
 */
export function getColorValue(color: string): string {
  return `hsl(${color})`;
}

/**
 * Get CSS variable name for a color
 */
export function getColorVariable(colorKey: keyof ThemeColors): string {
  // Exclude admin and resident as they are objects, not simple color strings
  type SimpleColorKey = Exclude<keyof ThemeColors, 'admin' | 'resident'>;
  const variableMap: Record<SimpleColorKey, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    success: '--success',
    successForeground: '--success-foreground',
    warning: '--warning',
    warningForeground: '--warning-foreground',
    info: '--info',
    infoForeground: '--info-foreground',
  };
  
  // Type guard to ensure we only access simple color keys
  if (colorKey === 'admin' || colorKey === 'resident') {
    return '';
  }
  
  return variableMap[colorKey as SimpleColorKey] || '';
}

/**
 * Theme utilities for programmatic access
 */
export const themeUtils = {
  /**
   * Get HSL color value for use in inline styles
   */
  hsl: (color: string): string => `hsl(${color})`,
  
  /**
   * Get CSS variable reference
   */
  var: (variable: string): string => `var(${variable})`,
  
  /**
   * Get spacing value
   */
  spacing: (size: keyof ThemeConfig['spacing'], theme: ThemeConfig = lightTheme): string => {
    return theme.spacing[size];
  },
  
  /**
   * Get font size
   */
  fontSize: (size: keyof ThemeConfig['typography']['fontSize'], theme: ThemeConfig = lightTheme): string => {
    return theme.typography.fontSize[size];
  },
  
  /**
   * Get shadow value
   */
  shadow: (size: keyof ThemeConfig['shadows'], theme: ThemeConfig = lightTheme): string => {
    return theme.shadows[size];
  },
};

/**
 * Export theme configurations
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

