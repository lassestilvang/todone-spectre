import { ExtensionConfig } from '../types/extensionTypes';

/**
 * Extension Config Service - Service for managing extension configuration
 * Handles configuration storage, validation, and updates
 */
class ExtensionConfigService {
  private config: ExtensionConfig;
  private configListeners: ((config: ExtensionConfig) => void)[];

  constructor() {
    this.config = this.getDefaultConfig();
    this.configListeners = [];
  }

  /**
   * Initialize the config service
   */
  public async initialize(): Promise<void> {
    try {
      // Load saved configuration
      const savedConfig = await this.loadConfig();
      if (savedConfig) {
        this.config = savedConfig;
      } else {
        // Save default config if none exists
        await this.saveConfig(this.config);
      }
    } catch (error) {
      console.error('Failed to initialize config service:', error);
      // Use default config if initialization fails
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<ExtensionConfig | null> {
    try {
      const result = await chrome.storage.sync.get('extensionConfig');
      return result.extensionConfig || null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfig(config: ExtensionConfig): Promise<void> {
    try {
      await chrome.storage.sync.set({ extensionConfig: config });
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): ExtensionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public async updateConfig(config: Partial<ExtensionConfig>): Promise<void> {
    try {
      // Validate the new configuration
      const validatedConfig = this.validateConfig({ ...this.config, ...config });

      // Update and save
      this.config = validatedConfig;
      await this.saveConfig(validatedConfig);

      // Notify listeners
      this.notifyConfigListeners(validatedConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
      throw error;
    }
  }

  /**
   * Reset configuration to defaults
   */
  public async resetConfig(): Promise<void> {
    try {
      this.config = this.getDefaultConfig();
      await this.saveConfig(this.config);
      this.notifyConfigListeners(this.config);
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: ExtensionConfig): ExtensionConfig {
    // Ensure sync interval is valid
    if (typeof config.syncInterval !== 'number' || config.syncInterval <= 0) {
      config.syncInterval = 300000; // Default: 5 minutes
    }

    // Ensure theme is valid
    if (!['system', 'light', 'dark'].includes(config.theme)) {
      config.theme = 'system';
    }

    return config;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ExtensionConfig {
    return {
      pageIntegrationEnabled: true,
      autoSyncEnabled: true,
      syncInterval: 300000, // 5 minutes
      showNotifications: true,
      theme: 'system',
      quickActions: [
        { id: 'create-task', label: 'Create Task', icon: 'plus' },
        { id: 'view-tasks', label: 'View Tasks', icon: 'list' },
        { id: 'sync-data', label: 'Sync Data', icon: 'sync' },
        { id: 'settings', label: 'Settings', icon: 'cog' }
      ]
    };
  }

  /**
   * Add config listener
   */
  public onConfigChange(callback: (config: ExtensionConfig) => void): void {
    this.configListeners.push(callback);
  }

  /**
   * Remove config listener
   */
  public removeConfigListener(callback: (config: ExtensionConfig) => void): void {
    this.configListeners = this.configListeners.filter(
      listener => listener !== callback
    );
  }

  /**
   * Notify all config listeners
   */
  private notifyConfigListeners(config: ExtensionConfig): void {
    this.configListeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        console.error('Config listener error:', error);
      }
    });
  }

  /**
   * Export configuration
   */
  public async exportConfig(): Promise<string> {
    try {
      return JSON.stringify(this.config, null, 2);
    } catch (error) {
      console.error('Failed to export config:', error);
      throw error;
    }
  }

  /**
   * Import configuration
   */
  public async importConfig(configData: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(configData);
      const validatedConfig = this.validateConfig(importedConfig);

      this.config = validatedConfig;
      await this.saveConfig(validatedConfig);
      this.notifyConfigListeners(validatedConfig);
    } catch (error) {
      console.error('Failed to import config:', error);
      throw error;
    }
  }

  /**
   * Get configuration value by key
   */
  public getConfigValue<K extends keyof ExtensionConfig>(key: K): ExtensionConfig[K] {
    return this.config[key];
  }

  /**
   * Set configuration value by key
   */
  public async setConfigValue<K extends keyof ExtensionConfig>(
    key: K,
    value: ExtensionConfig[K]
  ): Promise<void> {
    try {
      const updatedConfig = { ...this.config, [key]: value };
      const validatedConfig = this.validateConfig(updatedConfig);

      this.config = validatedConfig;
      await this.saveConfig(validatedConfig);
      this.notifyConfigListeners(validatedConfig);
    } catch (error) {
      console.error(`Failed to set config value ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if page integration is enabled
   */
  public isPageIntegrationEnabled(): boolean {
    return this.config.pageIntegrationEnabled;
  }

  /**
   * Check if auto sync is enabled
   */
  public isAutoSyncEnabled(): boolean {
    return this.config.autoSyncEnabled;
  }

  /**
   * Get sync interval in milliseconds
   */
  public getSyncInterval(): number {
    return this.config.syncInterval;
  }

  /**
   * Get theme setting
   */
  public getTheme(): ExtensionConfig['theme'] {
    return this.config.theme;
  }

  /**
   * Check if notifications are enabled
   */
  public areNotificationsEnabled(): boolean {
    return this.config.showNotifications;
  }
}

// Singleton instance
const extensionConfigServiceInstance = new ExtensionConfigService();

export default extensionConfigServiceInstance;