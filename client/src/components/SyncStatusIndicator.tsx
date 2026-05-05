import React, { useEffect, useState } from "react";
import { syncService } from "@/services/syncService";
import type { SyncState } from "@/services/syncService";
import { Cloud, CloudOff, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Sync Status Indicator Component
 * Displays cloud sync status in the sidebar with real-time updates
 */
export function SyncStatusIndicator() {
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    // Subscribe to sync state changes
    const unsubscribe = syncService.subscribe((state) => {
      setSyncState(state);
    });

    // Get initial state
    setSyncState(syncService.getSyncStatus());

    return () => {
      unsubscribe();
      syncService.destroy();
    };
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncService.manualSync();
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  if (!syncState) return null;

  const getStatusIcon = () => {
    if (syncState.isSyncing) {
      return (
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      );
    }

    if (!syncState.isOnline) {
      return <CloudOff className="w-4 h-4 text-gray-400" />;
    }

    if (syncState.failedChanges > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    if (syncState.pendingChanges > 0) {
      return <Cloud className="w-4 h-4 text-yellow-500" />;
    }

    return <Cloud className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncState.isSyncing) return "Syncing...";
    if (!syncState.isOnline) return "Offline";
    if (syncState.failedChanges > 0)
      return `${syncState.failedChanges} failed`;
    if (syncState.pendingChanges > 0)
      return `${syncState.pendingChanges} pending`;
    return "Synced";
  };

  const getStatusColor = () => {
    if (syncState.isSyncing) return "text-blue-500";
    if (!syncState.isOnline) return "text-gray-400";
    if (syncState.failedChanges > 0) return "text-red-500";
    if (syncState.pendingChanges > 0) return "text-yellow-500";
    return "text-green-500";
  };

  const tooltipContent = () => {
    let content = `Status: ${getStatusText()}\n`;
    if (syncState.lastSyncTimestamp) {
      const lastSync = new Date(syncState.lastSyncTimestamp);
      content += `Last sync: ${lastSync.toLocaleTimeString()}\n`;
    }
    if (syncState.syncError) {
      content += `Error: ${syncState.syncError}\n`;
    }
    content += `Pending: ${syncState.pendingChanges}\n`;
    content += `Failed: ${syncState.failedChanges}`;
    return content;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>

          {syncState.isOnline && !syncState.isSyncing && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleManualSync}
              disabled={isManualSyncing}
              title="Manual sync"
            >
              <RefreshCw
                className={`w-3 h-3 ${isManualSyncing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="whitespace-pre-wrap">
        {tooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
}
