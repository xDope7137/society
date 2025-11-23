/**
 * Centralized documentation of all localStorage keys used in the application
 * This helps with maintenance and cleanup of unused keys
 */

export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  
  // Application Settings (managed by SettingsContext)
  APP_SETTINGS: 'app_settings',
  
  // Theme (managed by next-themes)
  THEME: 'theme',
} as const;

/**
 * Get all localStorage keys used by the application
 */
export function getAllAppStorageKeys(): string[] {
  return Object.values(STORAGE_KEYS);
}

/**
 * Clean up localStorage by removing keys that are not in the allowed list
 * Useful for migration or cleanup
 */
export function cleanupStorage(allowedKeys: string[] = Object.values(STORAGE_KEYS)): string[] {
  const removed: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !allowedKeys.includes(key)) {
        localStorage.removeItem(key);
        removed.push(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
  }
  
  return removed;
}

/**
 * Clear all application-specific localStorage items
 * Useful for logout or reset
 */
export function clearAppStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
}

