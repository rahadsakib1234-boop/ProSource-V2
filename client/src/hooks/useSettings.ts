/**
 * useSettings Hook
 * Manages application settings
 */

import { useState, useCallback, useEffect } from 'react';
import { Settings } from '@/types';

const SETTINGS_KEY = 'ps_settings';
const DEFAULT_SETTINGS: Settings = {
  name: 'ProSource',
  wa: '',
  email: '',
  currency: 'BDT',
  invPrefix: 'INV-',
  industry: 'sourcing',
  isConfigured: false,
  authEnabled: false,
  templateCustomization: {
    stageLabels: {},
    fieldLabels: {},
    moduleVisibility: {},
  },
  invoiceBranding: {},
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Settings;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          templateCustomization: {
            ...DEFAULT_SETTINGS.templateCustomization,
            ...(parsed.templateCustomization || {}),
          },
          invoiceBranding: {
            ...DEFAULT_SETTINGS.invoiceBranding,
            ...(parsed.invoiceBranding || {}),
          },
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    try {
      const normalized: Settings = {
        ...DEFAULT_SETTINGS,
        ...newSettings,
        templateCustomization: {
          ...DEFAULT_SETTINGS.templateCustomization,
          ...(newSettings.templateCustomization || {}),
        },
        invoiceBranding: {
          ...DEFAULT_SETTINGS.invoiceBranding,
          ...(newSettings.invoiceBranding || {}),
        },
      };
      setSettings(normalized);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<Settings>) => {
      const updated = { ...settings, ...updates };
      return saveSettings(updated as Settings);
    },
    [settings, saveSettings]
  );

  const resetSettings = useCallback(() => {
    return saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saveSettings,
    updateSettings,
    resetSettings,
  };
}
