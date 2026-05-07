import React, { useState, useEffect } from 'react';
import { X, Download, RotateCcw, Trash2, Calendar } from 'lucide-react';
import { syncService } from '@/services/syncService';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  encrypted: boolean;
}

interface BackupListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (backupId: string) => void;
}

/**
 * Backup List Modal Component
 * Display all backups with restore and delete options
 */
export function BackupListModal({ isOpen, onClose, onRestore }: BackupListModalProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const result = await syncService.getBackups();
      setBackups(result || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to load backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId: string, filename: string) => {
    if (!window.confirm(`Restore from backup: ${filename}?\n\nThis will replace all current data.`)) {
      return;
    }

    setRestoring(backupId);
    try {
      await syncService.restoreBackup(backupId);
      onRestore(backupId);
      setMessage({
        type: 'success',
        text: `Restore started from ${filename}. Please wait...`,
      });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (backupId: string, filename: string) => {
    if (!window.confirm(`Delete backup: ${filename}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await syncService.deleteBackup(backupId);
      setBackups(backups.filter(b => b.id !== backupId));
      setMessage({
        type: 'success',
        text: `Backup deleted: ${filename}`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleDownload = async (backupId: string, filename: string) => {
    try {
      const url = await syncService.downloadBackup(backupId);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cloud Backups</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No backups yet</p>
              <p className="text-sm">Create your first backup from the Settings page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{backup.filename}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>📅 {new Date(backup.createdAt).toLocaleString()}</span>
                      <span>📦 {(backup.size / 1024 / 1024).toFixed(2)} MB</span>
                      {backup.encrypted && <span>🔒 Encrypted</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(backup.id, backup.filename)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRestore(backup.id, backup.filename)}
                      disabled={restoring === backup.id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className={`w-4 h-4 ${restoring === backup.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id, backup.filename)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={loadBackups}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
