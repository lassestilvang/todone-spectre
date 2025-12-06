// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useOfflineStore } from "../../store/useOfflineStore";
import { OfflineQueueItem } from "../../types/offlineTypes";

interface OfflineQueueProps {
  maxItems?: number;
  showControls?: boolean;
  onQueueChange?: (items: OfflineQueueItem[]) => void;
  onRetryAll?: () => void;
  onClearAll?: () => void;
}

export const OfflineQueue: React.FC<OfflineQueueProps> = ({
  maxItems = 10,
  showControls = true,
  onQueueChange,
  onRetryAll,
  onClearAll,
}) => {
  const { queue, retryQueueItem, clearQueue, isProcessing } = useOfflineStore();
  const [displayedItems, setDisplayedItems] = useState<OfflineQueueItem[]>([]);

  useEffect(() => {
    // Limit the number of items displayed
    const limitedItems = maxItems > 0 ? queue.slice(0, maxItems) : queue;
    setDisplayedItems(limitedItems);

    if (onQueueChange) {
      onQueueChange(limitedItems);
    }
  }, [queue, maxItems, onQueueChange]);

  const handleRetryItem = async (itemId: string) => {
    await retryQueueItem(itemId);
  };

  const handleRetryAll = async () => {
    if (onRetryAll) {
      onRetryAll();
    } else {
      // Retry all items in the queue
      for (const item of queue) {
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
      default:
        return "offline-queue-item-unknown";
    }
  };

  return (
    <div className="offline-queue">
      <h3 className="offline-queue-title">Offline Queue</h3>

      {queue.length === 0 ? (
        <div className="offline-queue-empty">
          No offline operations in queue
        </div>
      ) : (
        <>
          <div className="offline-queue-header">
            <span>Operation</span>
            <span>Type</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="offline-queue-items">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className={`offline-queue-item ${getItemStatusClass(item)}`}
              >
                <div className="offline-queue-item-operation">
                  <span className="offline-queue-item-name">
                    {item.operation}
                  </span>
                  <span className="offline-queue-item-timestamp">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="offline-queue-item-type">{item.type}</div>

                <div className="offline-queue-item-status">
                  {getItemStatusText(item)}
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
                </div>
              </div>
            ))}
          </div>

          {showControls && (
            <div className="offline-queue-controls">
              <button
                className="offline-queue-retry-all"
                onClick={handleRetryAll}
                disabled={isProcessing || queue.length === 0}
              >
                Retry All
              </button>

              <button
                className="offline-queue-clear-all"
                onClick={handleClearAll}
                disabled={queue.length === 0}
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
