// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useOfflineStore } from "../../store/useOfflineStore";
import {
  OfflineQueueItem,
  OfflineQueuePriority,
} from "../../types/offlineTypes";

interface OfflineQueueEnhancedProps {
  maxItems?: number;
  showControls?: boolean;
  showAdvancedFilters?: boolean;
  showBatchOperations?: boolean;
  showPriorityManagement?: boolean;
  onQueueChange?: (items: OfflineQueueItem[]) => void;
  onRetryAll?: () => void;
  onClearAll?: () => void;
  onPriorityChange?: (
    itemId: string,
    newPriority: OfflineQueuePriority,
  ) => void;
}

export const OfflineQueueEnhanced: React.FC<OfflineQueueEnhancedProps> = ({
  maxItems = 20,
  showControls = true,
  showAdvancedFilters = true,
  showBatchOperations = true,
  showPriorityManagement = true,
  onQueueChange,
  onRetryAll,
  onClearAll,
  onPriorityChange,
}) => {
  const {
    queue,
    retryQueueItem,
    clearQueue,
    isProcessing,
    updateQueueItemPriority,
    removeQueueItem,
    getQueueItemsByStatus,
    getQueueItemsByPriority,
  } = useOfflineStore();

  const [displayedItems, setDisplayedItems] = useState<OfflineQueueItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string | "all">("all");
  const [filterPriority, setFilterPriority] = useState<
    OfflineQueuePriority | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    // Apply filters and search
    let filteredItems = [...queue.items];

    // Filter by status
    if (filterStatus !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.status === filterStatus,
      );
    }

    // Filter by priority
    if (filterPriority !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.priority === filterPriority,
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.operation.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term) ||
          item.metadata?.description?.toLowerCase()?.includes(term) ||
          false,
      );
    }

    // Limit the number of items displayed
    const limitedItems =
      maxItems > 0 ? filteredItems.slice(0, maxItems) : filteredItems;
    setDisplayedItems(limitedItems);

    if (onQueueChange) {
      onQueueChange(limitedItems);
    }
  }, [
    queue.items,
    maxItems,
    filterStatus,
    filterPriority,
    searchTerm,
    onQueueChange,
  ]);

  const handleRetryItem = async (itemId: string) => {
    await retryQueueItem(itemId);
  };

  const handleRetryAll = async () => {
    if (onRetryAll) {
      onRetryAll();
    } else {
      // Retry all items in the queue
      for (const item of queue.items) {
        await retryQueueItem(item.id);
      }
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      clearQueue();
    }
  };

  const handlePriorityChange = async (
    itemId: string,
    newPriority: OfflineQueuePriority,
  ) => {
    if (onPriorityChange) {
      onPriorityChange(itemId, newPriority);
    }
    await updateQueueItemPriority(itemId, newPriority);
  };

  const handleRemoveItem = (itemId: string) => {
    removeQueueItem(itemId);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === displayedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(displayedItems.map((item) => item.id));
    }
  };

  const handleBulkRetry = async () => {
    for (const itemId of selectedItems) {
      await retryQueueItem(itemId);
    }
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const handleBulkRemove = () => {
    for (const itemId of selectedItems) {
      removeQueueItem(itemId);
    }
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const handleBulkPriorityChange = async (
    newPriority: OfflineQueuePriority,
  ) => {
    for (const itemId of selectedItems) {
      await updateQueueItemPriority(itemId, newPriority);
    }
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const getItemStatusText = (item: OfflineQueueItem) => {
    switch (item.status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "retrying":
        return "Retrying...";
      default:
        return "Unknown";
    }
  };

  const getItemStatusClass = (item: OfflineQueueItem) => {
    switch (item.status) {
      case "pending":
        return "offline-queue-item-pending";
      case "processing":
        return "offline-queue-item-processing";
      case "completed":
        return "offline-queue-item-completed";
      case "failed":
        return "offline-queue-item-failed";
      case "retrying":
        return "offline-queue-item-retrying";
      default:
        return "offline-queue-item-unknown";
    }
  };

  const getPriorityClass = (priority: OfflineQueuePriority | undefined) => {
    switch (priority) {
      case "critical":
        return "priority-critical";
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  const getPriorityText = (priority: OfflineQueuePriority | undefined) => {
    return priority || "medium";
  };

  // Get statistics for filters
  const statusStats = {
    all: queue.totalCount,
    pending: getQueueItemsByStatus("pending").length,
    processing: getQueueItemsByStatus("processing").length,
    completed: getQueueItemsByStatus("completed").length,
    failed: getQueueItemsByStatus("failed").length,
    retrying: getQueueItemsByStatus("retrying").length,
  };

  const priorityStats = {
    all: queue.totalCount,
    critical: getQueueItemsByPriority("critical").length,
    high: getQueueItemsByPriority("high").length,
    medium: getQueueItemsByPriority("medium").length,
    low: getQueueItemsByPriority("low").length,
  };

  return (
    <div className="offline-queue-enhanced">
      <h3 className="offline-queue-title">Enhanced Offline Queue</h3>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="offline-queue-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All ({statusStats.all})</option>
              <option value="pending">Pending ({statusStats.pending})</option>
              <option value="processing">
                Processing ({statusStats.processing})
              </option>
              <option value="completed">
                Completed ({statusStats.completed})
              </option>
              <option value="failed">Failed ({statusStats.failed})</option>
              <option value="retrying">
                Retrying ({statusStats.retrying})
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority:</label>
            <select
              id="priority-filter"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
            >
              <option value="all">All ({priorityStats.all})</option>
              <option value="critical">
                Critical ({priorityStats.critical})
              </option>
              <option value="high">High ({priorityStats.high})</option>
              <option value="medium">Medium ({priorityStats.medium})</option>
              <option value="low">Low ({priorityStats.low})</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search:</label>
            <input
              id="search-filter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search operations..."
            />
          </div>
        </div>
      )}

      {/* Queue Statistics */}
      <div className="queue-statistics">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{queue.totalCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">{queue.pendingCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Failed:</span>
          <span className="stat-value">{queue.failedCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{queue.completedCount}</span>
        </div>
      </div>

      {queue.items.length === 0 ? (
        <div className="offline-queue-empty">
          No offline operations in queue
        </div>
      ) : (
        <>
          {/* Bulk Operations */}
          {showBatchOperations && selectedItems.length > 0 && (
            <div className="bulk-operations">
              <button onClick={() => setShowBulkActions(!showBulkActions)}>
                {showBulkActions ? "Cancel" : "Bulk Actions"} (
                {selectedItems.length} selected)
              </button>

              {showBulkActions && (
                <div className="bulk-actions-menu">
                  <button onClick={handleBulkRetry} disabled={isProcessing}>
                    Retry Selected
                  </button>
                  <button onClick={handleBulkRemove} disabled={isProcessing}>
                    Remove Selected
                  </button>
                  <div className="priority-change">
                    <label>Change Priority:</label>
                    <select
                      onChange={(e) =>
                        handleBulkPriorityChange(
                          e.target.value as OfflineQueuePriority,
                        )
                      }
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="offline-queue-header">
            <div className="header-cell">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === displayedItems.length &&
                  displayedItems.length > 0
                }
                onChange={handleSelectAll}
                disabled={displayedItems.length === 0}
              />
            </div>
            <span>Operation</span>
            <span>Type</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Actions</span>
          </div>

          <div className="offline-queue-items">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className={`offline-queue-item ${getItemStatusClass(item)}`}
              >
                <div className="queue-item-cell">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>

                <div className="offline-queue-item-operation">
                  <span className="offline-queue-item-name">
                    {item.operation}
                  </span>
                  <span className="offline-queue-item-timestamp">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  {item.attempts > 0 && (
                    <span className="offline-queue-item-attempts">
                      Attempts: {item.attempts}
                    </span>
                  )}
                </div>

                <div className="offline-queue-item-type">{item.type}</div>

                <div className="offline-queue-item-status">
                  {getItemStatusText(item)}
                </div>

                <div className="offline-queue-item-priority">
                  {showPriorityManagement ? (
                    <select
                      value={getPriorityText(item.priority)}
                      onChange={(e) =>
                        handlePriorityChange(
                          item.id,
                          e.target.value as OfflineQueuePriority,
                        )
                      }
                      className={getPriorityClass(item.priority)}
                      disabled={item.status !== "pending"}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  ) : (
                    <span
                      className={`priority-badge ${getPriorityClass(item.priority)}`}
                    >
                      {getPriorityText(item.priority)}
                    </span>
                  )}
                </div>

                <div className="offline-queue-item-actions">
                  {item.status === "failed" && (
                    <button
                      className="offline-queue-retry-button"
                      onClick={() => handleRetryItem(item.id)}
                      disabled={isProcessing}
                    >
                      Retry
                    </button>
                  )}
                  <button
                    className="offline-queue-remove-button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isProcessing}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showControls && (
            <div className="offline-queue-controls">
              <button
                className="offline-queue-retry-all"
                onClick={handleRetryAll}
                disabled={isProcessing || queue.items.length === 0}
              >
                Retry All
              </button>

              <button
                className="offline-queue-clear-all"
                onClick={handleClearAll}
                disabled={queue.items.length === 0}
              >
                Clear All
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
