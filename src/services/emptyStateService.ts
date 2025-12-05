import { EmptyStateConfig } from "../types/emptyStateTypes";

class EmptyStateService {
  private static instance: EmptyStateService;
  private emptyStateConfigs: Map<string, EmptyStateConfig> = new Map();
  private defaultConfig: EmptyStateConfig = {
    title: "No content available",
    description: "There is nothing to display here yet",
    icon: null,
    actions: null,
    show: true,
  };

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): EmptyStateService {
    if (!EmptyStateService.instance) {
      EmptyStateService.instance = new EmptyStateService();
    }
    return EmptyStateService.instance;
  }

  /**
   * Register a new empty state configuration
   * @param key Unique identifier for the empty state
   * @param config Empty state configuration
   */
  public registerEmptyState(key: string, config: EmptyStateConfig): void {
    this.emptyStateConfigs.set(key, { ...this.defaultConfig, ...config });
  }

  /**
   * Get empty state configuration by key
   * @param key Unique identifier for the empty state
   * @returns Empty state configuration or default if not found
   */
  public getEmptyStateConfig(key: string): EmptyStateConfig {
    return this.emptyStateConfigs.get(key) || this.defaultConfig;
  }

  /**
   * Update existing empty state configuration
   * @param key Unique identifier for the empty state
   * @param config Partial empty state configuration to update
   */
  public updateEmptyStateConfig(
    key: string,
    config: Partial<EmptyStateConfig>,
  ): void {
    const existingConfig = this.getEmptyStateConfig(key);
    this.emptyStateConfigs.set(key, { ...existingConfig, ...config });
  }

  /**
   * Remove empty state configuration
   * @param key Unique identifier for the empty state
   */
  public removeEmptyStateConfig(key: string): void {
    this.emptyStateConfigs.delete(key);
  }

  /**
   * Check if an empty state should be shown
   * @param key Unique identifier for the empty state
   * @returns Boolean indicating if empty state should be shown
   */
  public shouldShowEmptyState(key: string): boolean {
    const config = this.getEmptyStateConfig(key);
    return config.show;
  }

  /**
   * Set visibility for an empty state
   * @param key Unique identifier for the empty state
   * @param show Boolean to set visibility
   */
  public setEmptyStateVisibility(key: string, show: boolean): void {
    this.updateEmptyStateConfig(key, { show });
  }

  /**
   * Get all registered empty state configurations
   * @returns Map of all empty state configurations
   */
  public getAllEmptyStateConfigs(): Map<string, EmptyStateConfig> {
    return new Map(this.emptyStateConfigs);
  }

  /**
   * Reset all empty state configurations to default
   */
  public resetAllEmptyStates(): void {
    this.emptyStateConfigs.clear();
  }
}

// Export singleton instance
export const emptyStateService = EmptyStateService.getInstance();
