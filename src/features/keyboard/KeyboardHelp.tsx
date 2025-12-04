import React from 'react';
import { useKeyboardContext } from './KeyboardProvider';
import { KeyboardShortcutItem } from './KeyboardShortcutItem';

export const KeyboardHelp: React.FC = () => {
  const { shortcuts, isHelpVisible, toggleHelp } = useKeyboardContext();

  if (!isHelpVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          <button
            onClick={toggleHelp}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {shortcuts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No keyboard shortcuts registered.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, index) => (
                <KeyboardShortcutItem
                  key={`${shortcut.key}-${shortcut.modifiers?.join('-')}-${index}`}
                  shortcut={shortcut}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleHelp}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};