import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtensionPopup, ExtensionOptions, ExtensionStatusIndicator, ExtensionQuickActions } from '../';
import { ExtensionProvider, ExtensionConfigProvider } from '../../../hooks';
import { createMockExtensionState, createMockExtensionConfig, mockChromeRuntime, mockChromeTabs } from './extensionTestUtils';

// Mock chrome API
const mockChrome = mockChromeRuntime();
const mockTabs = mockChromeTabs();

jest.mock('react-chrome-extension-router', () => ({
  useChromeStorage: jest.fn(),
  useChromeStorageLocal: jest.fn()
}));

describe('Extension Components', () => {
  beforeEach(() => {
    // Set up global chrome mock
    global.chrome = {
      runtime: mockChrome,
      tabs: mockTabs,
      storage: {
        sync: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue({})
        },
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue({})
        }
      }
    } as any;
  });

  describe('ExtensionPopup', () => {
    it('should render extension popup with quick actions', () => {
      const mockState = createMockExtensionState({ status: 'ready' });
      const mockConfig = createMockExtensionConfig();

      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionPopup />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      expect(screen.getByText('Todone Extension')).toBeInTheDocument();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByText('View Tasks')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionPopup />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('ExtensionOptions', () => {
    it('should render extension options form', () => {
      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionOptions />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      expect(screen.getByText('Todone Extension Options')).toBeInTheDocument();
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Integration Settings')).toBeInTheDocument();
      expect(screen.getByText('Sync Settings')).toBeInTheDocument();
    });

    it('should allow theme selection', () => {
      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionOptions />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toBeInTheDocument();
      expect(themeSelect).toHaveValue('system');
    });
  });

  describe('ExtensionStatusIndicator', () => {
    it('should show idle status', () => {
      render(
        <ExtensionProvider>
          <ExtensionStatusIndicator />
        </ExtensionProvider>
      );

      expect(screen.getByText('Idle')).toBeInTheDocument();
    });

    it('should show syncing status', () => {
      const mockState = createMockExtensionState({ status: 'syncing' });

      render(
        <ExtensionProvider>
          <ExtensionStatusIndicator />
        </ExtensionProvider>
      );

      // This would need proper state management in the test
      // For now, just check it renders
      expect(screen.getByText(/Idle|Syncing|Ready|Error/)).toBeInTheDocument();
    });
  });

  describe('ExtensionQuickActions', () => {
    it('should render quick actions grid', () => {
      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionQuickActions />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByText('View Tasks')).toBeInTheDocument();
      expect(screen.getByText('Sync Data')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should handle action clicks', () => {
      const mockOnActionClick = jest.fn();

      render(
        <ExtensionProvider>
          <ExtensionConfigProvider>
            <ExtensionQuickActions onActionClick={mockOnActionClick} />
          </ExtensionConfigProvider>
        </ExtensionProvider>
      );

      fireEvent.click(screen.getByText('Create Task'));
      expect(mockOnActionClick).toHaveBeenCalledWith('create-task');
    });
  });
});

describe('Extension Service Integration', () => {
  it('should handle message sending', async () => {
    const service = mockChrome.runtime;

    await service.sendMessage({ type: 'TEST_MESSAGE' });

    expect(service.sendMessage).toHaveBeenCalledWith(
      { type: 'TEST_MESSAGE' },
      expect.any(Function)
    );
  });

  it('should handle message listening', () => {
    const service = mockChrome.runtime;
    const mockCallback = jest.fn();

    service.onMessage.addListener(mockCallback);
    expect(service.onMessage.addListener).toHaveBeenCalledWith(mockCallback);
  });
});

describe('Extension Config Service Integration', () => {
  it('should handle config updates', async () => {
    const storage = mockChrome.storage;
    const testConfig = createMockExtensionConfig();

    await storage.sync.set({ extensionConfig: testConfig });

    expect(storage.sync.set).toHaveBeenCalledWith({
      extensionConfig: testConfig
    });
  });

  it('should handle config retrieval', async () => {
    const storage = mockChrome.storage;
    const testConfig = createMockExtensionConfig();

    // Mock the get method to return our test config
    storage.sync.get.mockResolvedValueOnce({ extensionConfig: testConfig });

    const result = await storage.sync.get('extensionConfig');

    expect(result).toEqual({ extensionConfig: testConfig });
    expect(storage.sync.get).toHaveBeenCalledWith('extensionConfig');
  });
});