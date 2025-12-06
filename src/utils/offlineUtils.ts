/**
 * Offline Data Transformation Utilities
 *
 * This module provides utilities for transforming and preparing data
 * for offline storage and synchronization.
 */

import { OfflineQueueItem } from "../types/offlineTypes";

/**
 * Transform data for offline storage
 * Converts complex objects to a format suitable for offline storage
 */
export function transformDataForOfflineStorage(data: any): any {
  // Remove circular references
  const removeCircularReferences = (obj: any): any => {
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      }),
    );
  };

  // Convert dates to ISO strings
  const convertDates = (obj: any): any => {
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(convertDates);
    }

    if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, convertDates(value)]),
      );
    }

    return obj;
  };

  // Remove sensitive data
  const sanitizeData = (obj: any): any => {
    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          key.toLowerCase().includes("password") ||
          key.toLowerCase().includes("token") ||
          key.toLowerCase().includes("secret")
        ) {
          continue; // Skip sensitive fields
        }
        sanitized[key] = sanitizeData(value);
      }
      return sanitized;
    }

    return obj;
  };

  return sanitizeData(convertDates(removeCircularReferences(data)));
}

/**
 * Transform offline data back to application format
 * Converts offline storage format back to application objects
 */
export function transformOfflineDataToApplication(data: any): any {
  // Convert ISO strings back to Date objects
  const convertDateStrings = (obj: any): any => {
    if (
      typeof obj === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)
    ) {
      return new Date(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(convertDateStrings);
    }

    if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          convertDateStrings(value),
        ]),
      );
    }

    return obj;
  };

  return convertDateStrings(data);
}

/**
 * Prepare data for offline queue item
 * Creates a properly formatted queue item from raw data
 */
export function prepareQueueItemData(
  operation: string,
  type: "create" | "update" | "delete" | "sync",
  data: any,
): Omit<OfflineQueueItem, "id" | "timestamp" | "status" | "attempts"> {
  return {
    operation,
    type,
    data: transformDataForOfflineStorage(data),
  };
}

/**
 * Batch transform multiple items for offline storage
 */
export function batchTransformForOfflineStorage(items: any[]): any[] {
  return items.map((item) => transformDataForOfflineStorage(item));
}

/**
 * Batch transform offline data back to application format
 */
export function batchTransformOfflineToApplication(items: any[]): any[] {
  return items.map((item) => transformOfflineDataToApplication(item));
}

/**
 * Create data snapshot for offline storage
 * Creates a point-in-time snapshot of data with metadata
 */
export function createDataSnapshot(data: any, snapshotName: string): any {
  return {
    snapshotName,
    timestamp: new Date().toISOString(),
    data: transformDataForOfflineStorage(data),
    version: "1.0",
  };
}

/**
 * Compare data snapshots for changes
 * Returns true if there are differences between snapshots
 */
export function compareDataSnapshots(
  oldSnapshot: any,
  newSnapshot: any,
): boolean {
  return JSON.stringify(oldSnapshot.data) !== JSON.stringify(newSnapshot.data);
}

/**
 * Merge data changes from offline to online
 * Simple merge strategy for combining offline and online data
 */
export function mergeOfflineChanges(offlineData: any, onlineData: any): any {
  // For objects, merge properties
  if (
    typeof offlineData === "object" &&
    offlineData !== null &&
    typeof onlineData === "object" &&
    onlineData !== null
  ) {
    return { ...onlineData, ...offlineData };
  }

  // For arrays, concatenate
  if (Array.isArray(offlineData) && Array.isArray(onlineData)) {
    return [...onlineData, ...offlineData];
  }

  // For other types, prefer offline data
  return offlineData;
}

/**
 * Validate data for offline storage
 * Checks if data is suitable for offline storage
 */
export function validateDataForOfflineStorage(data: any): boolean {
  try {
    // Check if data can be serialized
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compress data for offline storage
 * Simple compression using JSON stringify and base64 encoding
 */
export function compressDataForStorage(data: any): string {
  const jsonString = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonString));
}

/**
 * Decompress data from offline storage
 * Decodes base64 encoded compressed data
 */
export function decompressDataFromStorage(compressedData: string): any {
  try {
    const decodedString = decodeURIComponent(atob(compressedData));
    return JSON.parse(decodedString);
  } catch {
    console.error("Failed to decompress data");
    return null;
  }
}
