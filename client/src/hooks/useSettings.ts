/**
 * useSettings Hook
 * Manages application settings in the cloud
 */

import { useState, useCallback, useEffect } from 'react';
import { Settings } from '@/types';
import { cloudDb } from '@/services/cloudDb';
import { useAuth } from './useAuth';

const DEFAULT_SETTINGS: Settings = {
  id: '',
  organizationId: '',
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
  dashboardBlueprint: [],
  crmBlueprint: [],
  operationsBlueprint: [],
  financeBlueprint: [],
  reportsBlueprint: [],
  kpiBlueprint: [],
  workflowBlueprint: [],
  actionBlueprint: [],
  updatedAt: new Date().toISOString(),
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await cloudDb.get<Settings>('settings', '', user.organizationId);
      // Note: Settings table has a unique organization_id.
      // If we don't have a specific ID, we can fetch by organization_id manually.
      // Let's implement a specific method in cloudDb or use a simplified query.

      // Simplified fallback: Fetch any setting for this org.
      const all = await cloudDb.getAll<Settings>('settings', user.organizationId);
      const current = all[0] || DEFAULT_SETTINGS;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...current,
        templateCustomization: {
          ...DEFAULT_SETTINGS.templateCustomization,
          ...(current.templateCustomization || {}),
        },
        invoiceBranding: {
          ...DEFAULT_SETTINGS.invoiceBranding,
          ...(current.invoiceBranding || {}),
        },
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    if (!user?.organizationId) return false;
    try {
      const normalized: Settings = {
        ...DEFAULT_SETTINGS,
        ...newSettings,
        organizationId: user.organizationId,
        templateCustomization: {
          ...DEFAULT_SETTINGS.templateCustomization,
          ...(newSettings.templateCustomization || {}),
        },
        invoiceBranding: {
          ...DEFAULT_SETTINGS.invoiceBranding,
          ...(newSettings.invoiceBranding || {}),
        },
      };

      // If it's a new organization, we might need to generate an ID
      if (!normalized.id) {
        normalized.id = crypto.randomUUID();
      }

      await cloudDb.put('settings', normalized, user.organizationId);
      setSettings(normalized);
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  }, [user?.organizationId]);

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      const updated = { ...settings, ...updates };
      return await saveSettings(updated as Settings);
    },
    [settings, saveSettings]
  );

  const resetSettings = useCallback(async () => {
    return await saveSettings(DEFAULT_SETTINGS);
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
