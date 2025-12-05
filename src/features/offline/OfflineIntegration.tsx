/**
 * Comprehensive Offline Integration Component
 * Integrates all offline functionality with the existing Todone application
 */
import React, { useState, useEffect } from "react";
import { useOfflineTasks } from "../../hooks/useOfflineTasks";
import { useOfflineDataPersistence } from "../../hooks/useOfflineDataPersistence";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { useOfflineStore } from "../../store/useOfflineStore";
import { Task } from "../../types/task";
import { OfflineIndicator } from "./OfflineIndicator";
import { OfflineQueue } from "./OfflineQueue";
import { OfflineSync } from "./OfflineSync";
import { OfflineSettings } from "./OfflineSettings";

export const OfflineIntegration: React.FC = () => {
  const [demoTask, setDemoTask] = useState<Omit<Task, "id">>({
    title: "Sample Offline Task",
    description: "This task will be created offline and synced when online",
    status: "todo",
    priority: "medium",
    projectId: "demo-project",
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false,
  });

  // Offline task management
  const {
    isOffline,
    pendingOfflineOperations,
    createTaskOffline,
    updateTaskOffline,
    deleteTaskOffline,
    toggleCompletionOffline,
    processOfflineQueue,
    hasPendingOperations,
  } = useOfflineTasks();

  // Offline data persistence
  const {
    isSyncing: isDataSyncing,
    pendingOperations: pendingDataOperations,
    syncOfflineData,
    needsSync: needsDataSync,
    storageStats,
  } = useOfflineDataPersistence();

  // Offline sync
  const {
    isSyncing,
    lastSynced,
    pendingOperations,
    syncAll,
    needsSync,
    getComprehensiveOfflineStatus,
  } = useOfflineSync();

  // Offline store
  const offlineStore = useOfflineStore();

  // Demo: Create a task offline
  const handleCreateDemoTask = async () => {
    try {
      const task = await createTaskOffline(demoTask);
      alert(`Task created offline: ${task.title} (ID: ${task.id})`);
    } catch (error) {
      alert(
        `Failed to create task offline: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Process offline queue
  const handleProcessQueue = async () => {
    try {
      await processOfflineQueue();
      alert("Offline queue processed successfully!");
    } catch (error) {
      alert(
        `Failed to process queue: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Sync all offline data
  const handleSyncAll = async () => {
    try {
      await syncAll();
      alert("All offline data synced successfully!");
    } catch (error) {
      alert(
        `Failed to sync: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Toggle network status (for testing)
  const handleToggleNetwork = () => {
    const newStatus = !offlineStore.status.isOffline;
    offlineStore.simulateNetworkChange(newStatus);
    alert(`Network status changed to: ${newStatus ? "Offline" : "Online"}`);
  };

  return (
    <div className="offline-integration-container">
      <h1 className="text-2xl font-bold mb-6">Offline Integration Dashboard</h1>

      {/* Offline Status Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Offline Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Network Status</div>
            <div
              className={`text-2xl font-bold ${isOffline ? "text-red-600" : "text-green-600"}`}
            >
              {isOffline ? "OFFLINE" : "ONLINE"}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Pending Operations</div>
            <div className="text-2xl font-bold text-blue-600">
              {pendingOperations}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Last Synced</div>
            <div className="text-2xl font-bold text-purple-600">
              {lastSynced ? lastSynced.toLocaleString() : "Never"}
            </div>
          </div>
        </div>
      </div>

      {/* Offline Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OfflineIndicator />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OfflineQueue />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OfflineSync />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OfflineSettings />
        </div>
      </div>

      {/* Demo Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Offline Integration Demo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleCreateDemoTask}
            disabled={!isOffline}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Create Demo Task Offline
          </button>

          <button
            onClick={handleProcessQueue}
            disabled={isOffline || !hasPendingOperations()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
          >
            Process Offline Queue
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isOffline || !needsSync()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            Sync All Offline Data
          </button>

          <button
            onClick={handleToggleNetwork}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Toggle Network (Test)
          </button>
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Offline Storage Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Tasks in Storage</div>
            <div className="text-xl font-bold text-blue-600">
              {storageStats.taskCount}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Queue Size</div>
            <div className="text-xl font-bold text-green-600">
              {storageStats.queueSize}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Storage Usage</div>
            <div className="text-xl font-bold text-purple-600">
              {Math.round(storageStats.storageUsage / 1024)} KB
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Status */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Comprehensive Offline Status
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(getComprehensiveOfflineStatus(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
