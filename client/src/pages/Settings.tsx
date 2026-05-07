/*
 * Settings Page
 * Configure application settings and preferences
 */

import { useState, useEffect } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { INDUSTRY_PROFILES } from '@/services/industries';
import { syncService } from '@/services/syncService';
import { BackupListModal } from '@/components/BackupListModal';
import { alertService } from '@/services/alertService';

export default function Settings() {
  const [, setLocation] = useHashLocation();
  const { settings, auth } = useApp();
  const [formData, setFormData] = useState(settings.settings);
  const [saved, setSaved] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);

  useEffect(() => {
    setFormData(settings.settings);
  }, [settings.settings]);

  const handleSave = () => {
    settings.saveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupMessage(null);
    
    try {
      const result = await syncService.createBackup();
      const filename = `prosource-backup-${new Date().toISOString().split('T')[0]}.enc`;
      setBackupMessage({
        type: 'success',
        text: `✓ Backup created successfully (${(result.size / 1024 / 1024).toFixed(2)} MB)`
      });
      alertService.alertBackupCompleted(filename, result.size);
    } catch (error) {
      setBackupMessage({
        type: 'error',
        text: `✗ Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      alertService.alertSyncFailed(error instanceof Error ? error.message : 'Backup creation failed');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleListBackups = () => {
    setShowBackupModal(true);
  };

  const handleRestoreBackup = (backupId: string) => {
    alertService.alertRestoreTriggered(`backup-${backupId}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your CRM preferences</p>
        </div>

        {/* Settings Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="space-y-6">
            {/* Business Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.wa}
                    onChange={(e) => setFormData({ ...formData, wa: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Industry (CRM Type)</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {INDUSTRY_PROFILES.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changing the industry will update terminology and available modules.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Financial Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Default Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={formData.invPrefix}
                    onChange={(e) => setFormData({ ...formData, invPrefix: e.target.value })}
                    placeholder="INV-"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: {formData.invPrefix}001, {formData.invPrefix}002
                  </p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">About</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>ProSource CRM</strong> v2.0.0
                </p>
                <p>A professional CRM solution for sourcing businesses</p>
                <p className="pt-2">
                  <strong>Data Storage:</strong> Local IndexedDB + Cloud Sync
                </p>
                <p>
                  <strong>Cloud Backup:</strong> Encrypted with AES-256
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2 mt-8 pt-6 border-t border-border">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <span>✓</span>
                <span>Settings saved successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Cloud Backup & Restore */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
          <h3 className="font-semibold text-foreground mb-4">☁️ Cloud Backup & Restore</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Securely backup your data to the cloud with AES-256 encryption. Admins can restore from previous backups.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingBackup ? '⏳ Creating backup...' : '💾 Create Cloud Backup'}
            </button>
            <button 
              onClick={handleListBackups}
              className="w-full px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors text-left"
            >
              📋 View Backups
            </button>
          </div>
          {backupMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              backupMessage.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {backupMessage.text}
            </div>
          )}
        </div>

        {/* Team Management */}
        {auth.user?.role === 'admin' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4">👥 Team Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage employees, assign roles, and control team access to your CRM.
            </p>
            <button 
              onClick={() => setLocation('/employees')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              Manage Team Members
            </button>
          </div>
        )}

        {/* Data Management */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
          <h3 className="font-semibold text-foreground mb-4">Local Data Management</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors text-left">
              📥 Export All Data
            </button>
            <button className="w-full px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors text-left">
              📤 Import Data
            </button>
            <button className="w-full px-4 py-2 border border-red-200 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors text-left text-red-600">
              🗑️ Clear All Data (Irreversible)
            </button>
          </div>
        </div>
      </div>

      {/* Backup List Modal */}
      <BackupListModal 
        isOpen={showBackupModal} 
        onClose={() => setShowBackupModal(false)}
        onRestore={handleRestoreBackup}
      />
    </Layout>
  );
}
