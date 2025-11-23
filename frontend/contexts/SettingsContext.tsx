'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Settings {
  // UI State
  sidebarOpen: boolean;
  
  // View Preferences
  pageSize: number;
  
  // Filter Preferences (per page)
  filters: {
    [page: string]: {
      [key: string]: any;
    };
  };
  
  // Search Preferences (per page)
  searchTerms: {
    [page: string]: string;
  };
  
  // Table Preferences
  tableColumns: {
    [page: string]: {
      visible: string[];
      order: string[];
    };
  };
  
  // Sort Preferences (per page)
  sortPreferences: {
    [page: string]: {
      field: string;
      direction: 'asc' | 'desc';
    };
  };
  
  // Notification Preferences
  notifications: {
    enabled: boolean;
    sound: boolean;
    email: boolean;
  };
  
  // Auto-refresh intervals (in seconds, 0 = disabled)
  autoRefresh: {
    [page: string]: number;
  };
}

const defaultSettings: Settings = {
  sidebarOpen: false,
  pageSize: 20,
  filters: {},
  searchTerms: {},
  tableColumns: {},
  sortPreferences: {},
  notifications: {
    enabled: true,
    sound: true,
    email: false,
  },
  autoRefresh: {},
};

const STORAGE_KEY = 'app_settings';

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateNestedSetting: <K extends keyof Settings>(
    key: K,
    nestedKey: string,
    value: any
  ) => void;
  getFilter: (page: string, filterKey: string) => any;
  setFilter: (page: string, filterKey: string, value: any) => void;
  getSearchTerm: (page: string) => string;
  setSearchTerm: (page: string, value: string) => void;
  getPageSize: () => number;
  setPageSize: (size: number) => void;
  resetSettings: () => void;
  resetPageSettings: (page: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      // Use defaults if there's an error
      setSettings(defaultSettings);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings to localStorage:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateNestedSetting = useCallback(<K extends keyof Settings>(
    key: K,
    nestedKey: string,
    value: any
  ) => {
    setSettings((prev) => {
      const current = prev[key];
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        return {
          ...prev,
          [key]: {
            ...current,
            [nestedKey]: value,
          },
        };
      }
      return prev;
    });
  }, []);

  const getFilter = useCallback((page: string, filterKey: string) => {
    return settings.filters[page]?.[filterKey];
  }, [settings.filters]);

  const setFilter = useCallback((page: string, filterKey: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [page]: {
          ...prev.filters[page],
          [filterKey]: value,
        },
      },
    }));
  }, []);

  const getSearchTerm = useCallback((page: string) => {
    return settings.searchTerms[page] || '';
  }, [settings.searchTerms]);

  const setSearchTerm = useCallback((page: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      searchTerms: {
        ...prev.searchTerms,
        [page]: value,
      },
    }));
  }, []);

  const getPageSize = useCallback(() => {
    return settings.pageSize;
  }, [settings.pageSize]);

  const setPageSize = useCallback((size: number) => {
    updateSetting('pageSize', size);
  }, [updateSetting]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing settings from localStorage:', error);
    }
  }, []);

  const resetPageSettings = useCallback((page: string) => {
    setSettings((prev) => {
      const newFilters = { ...prev.filters };
      const newSearchTerms = { ...prev.searchTerms };
      const newSortPreferences = { ...prev.sortPreferences };
      const newTableColumns = { ...prev.tableColumns };
      
      delete newFilters[page];
      delete newSearchTerms[page];
      delete newSortPreferences[page];
      delete newTableColumns[page];

      return {
        ...prev,
        filters: newFilters,
        searchTerms: newSearchTerms,
        sortPreferences: newSortPreferences,
        tableColumns: newTableColumns,
      };
    });
  }, []);

  const value: SettingsContextType = {
    settings,
    updateSetting,
    updateNestedSetting,
    getFilter,
    setFilter,
    getSearchTerm,
    setSearchTerm,
    getPageSize,
    setPageSize,
    resetSettings,
    resetPageSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

